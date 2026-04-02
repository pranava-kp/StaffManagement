import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import rnsLogo from "../../../../assets/images/rns-logo.webp";
import { createLeave } from "../../../../services/operations/leaveAPI";

const NewLeave = () => {
    const [substituteTeachers, setSubstituteTeachers] = useState({});
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subject: "",
        body: "",
        startDate: "",
        endDate: "",
        category: "",
        otherCategory: "",
    });

    const [attachments, setAttachments] = useState([]); // Now stores raw File objects
    const [startDateObj, setStartDateObj] = useState(null);
    const [endDateObj, setEndDateObj] = useState(null);

    const [staffList, setStaffList] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const getYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
    };

    const isNotSunday = (date) => {
        return date.getDay() !== 0;
    };

    const getMaxEndDate = (start) => {
        if (!start) return null;
        let count = 0;
        let current = new Date(start);
        while (count < 3) {
            current.setDate(current.getDate() + 1);
            if (current.getDay() !== 0) {
                count++;
            }
        }
        return current;
    };

    const formatForApi = (dateObj) => {
        if (!dateObj) return "";
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Fetch Staff List
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch("http://localhost:2000/api/v1/getuserdept", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const responseData = await response.json();

                if (responseData?.success && responseData?.data?.users) {
                    setStaffList(responseData.data.users);
                } else {
                    setStaffList([]);
                }
            } catch (error) {
                console.error("Failed to fetch staff list:", error);
                setStaffList([]);
            }
        };

        if (token) {
            fetchStaff();
        }
    }, [token]);

    // Initialize daily schedule based on date range
    useEffect(() => {
        if (startDateObj && endDateObj && startDateObj <= endDateObj) {
            const dates = [];
            let curr = new Date(startDateObj);
            const end = new Date(endDateObj);
            while (curr <= end) {
                if (curr.getDay() !== 0) { // Skip Sundays
                    dates.push(formatForApi(curr));
                }
                curr.setDate(curr.getDate() + 1);
            }

            setSubstituteTeachers((prev) => {
                const newState = {};
                dates.forEach((dateStr) => {
                    newState[dateStr] = prev[dateStr] || { hasClass: null, periods: [] };
                });
                return newState;
            });
        } else {
            setSubstituteTeachers({});
        }
    }, [startDateObj, endDateObj]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClassRadio = (dateStr, value) => {
        setSubstituteTeachers((prev) => ({
            ...prev,
            [dateStr]: {
                ...prev[dateStr],
                hasClass: value,
                periods: value === "yes" && prev[dateStr].periods.length === 0
                    ? [{ hour: "", substitute: "", substituteId: "" }]
                    : prev[dateStr].periods
            }
        }));
    };

    const handleAddPeriod = (dateStr) => {
        setSubstituteTeachers((prev) => ({
            ...prev,
            [dateStr]: {
                ...prev[dateStr],
                periods: [...prev[dateStr].periods, { hour: "", substitute: "", substituteId: "" }]
            }
        }));
    };

    // Updated to capture the MongoDB _id
    const handlePeriodChange = (dateStr, index, field, value, staffId = null) => {
        setSubstituteTeachers((prev) => {
            const updatedPeriods = [...prev[dateStr].periods];
            updatedPeriods[index][field] = value;
            if (staffId) {
                updatedPeriods[index].substituteId = staffId;
            } else if (field === "substitute") {
                // Clear the ID if the user starts typing manually to force a fresh selection
                updatedPeriods[index].substituteId = "";
            }
            return {
                ...prev,
                [dateStr]: {
                    ...prev[dateStr],
                    periods: updatedPeriods
                }
            };
        });
    };

    const handleRemovePeriod = (dateStr, index) => {
        setSubstituteTeachers((prev) => {
            const updatedPeriods = prev[dateStr].periods.filter((_, i) => i !== index);
            return {
                ...prev,
                [dateStr]: {
                    ...prev[dateStr],
                    periods: updatedPeriods
                }
            };
        });
    };

    const formatStaffName = (staff) => {
        const firstName = staff?.firstName || "";
        const lastName = staff?.lastName || "";
        const department = staff?.department?.departmentName || staff?.department || "No Dept";
        return `${firstName} ${lastName} (${department})`.trim();
    };

    const isFormValid = () => {
        if (!formData.subject.trim()) return false;
        if (!formData.body.trim()) return false;
        if (!startDateObj || !endDateObj) return false;
        if (!formData.category) return false;
        if (formData.category === "Others" && !formData.otherCategory.trim()) return false;

        const dates = Object.keys(substituteTeachers);
        if (dates.length === 0 && startDateObj && endDateObj) return false;

        for (let i = 0; i < dates.length; i++) {
            const dateStr = dates[i];
            const dayData = substituteTeachers[dateStr];

            if (dayData.hasClass === null) return false;

            if (dayData.hasClass === "yes") {
                if (dayData.periods.length === 0) return false;
                for (let j = 0; j < dayData.periods.length; j++) {
                    const period = dayData.periods[j];
                    // Require both hour and a valid selected substituteId
                    if (!period.hour.trim() || !period.substituteId) return false;
                }
            }
        }
        return true;
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) return;

        setLoading(true);
        try {
            // 1. Format substituteTeachers exactly as the backend expects
            const formattedSubstituteTeachers = {};

            Object.keys(substituteTeachers).forEach((dateStr) => {
                const dayData = substituteTeachers[dateStr];
                if (dayData.hasClass === "yes") {
                    formattedSubstituteTeachers[dateStr] = {};
                    dayData.periods.forEach((period) => {
                        formattedSubstituteTeachers[dateStr][period.hour] = period.substituteId;
                    });
                }
            });

            // 2. Build the FormData object
            const formDataToSend = new FormData();
            formDataToSend.append("category", formData.category === "Others" ? formData.otherCategory : formData.category);
            formDataToSend.append("subject", formData.subject);
            formDataToSend.append("body", formData.body);
            formDataToSend.append("startDate", formatForApi(startDateObj));
            formDataToSend.append("endDate", formatForApi(endDateObj));
            formDataToSend.append("substituteTeachers", JSON.stringify(formattedSubstituteTeachers));

            // 3. Append the file if one exists
            if (attachments.length > 0) {
                formDataToSend.append("supportDocument", attachments[0]);
            }

            // 4. Dispatch the completely assembled form data
            const result = await dispatch(createLeave(formDataToSend, token));

            if (result?.success) {
                navigate("/dashboard/staff");
            }

        } catch (e) {
            console.error("Error in creating leave: ", e);
        } finally {
            setLoading(false);
        }
    };

    // Simply stores the files locally for submission
    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(files);
    };

    const removeAttachment = (idx) => {
        setAttachments((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">
                {/* HEADER */}
                <div className="flex items-center gap-4 mb-8">
                    <img src={rnsLogo} alt="Logo" className="w-12" />
                    <div>
                        <h1 className="text-3xl font-bold text-blue-600">
                            Leave Application
                        </h1>
                        <p className="text-sm text-gray-500">
                            Submit a new leave request
                        </p>
                    </div>
                </div>

                <form onSubmit={handleOnSubmit} className="flex flex-col gap-6">
                    {/* SUBJECT */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 uppercase">
                            Subject *
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleOnChange}
                            placeholder="Enter subject"
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 outline-none"
                            required
                            autoComplete="off"
                        />
                    </div>

                    {/* REASON */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 uppercase">
                            Detailed Reason *
                        </label>
                        <textarea
                            name="body"
                            value={formData.body}
                            onChange={handleOnChange}
                            rows="5"
                            placeholder="Explain your leave reason"
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 outline-none"
                            required
                        />
                    </div>

                    {/* DATE + TYPE */}
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="text-sm font-semibold uppercase mb-2 block">
                                From *
                            </label>
                            <DatePicker
                                selected={startDateObj}
                                onChange={(date) => {
                                    setStartDateObj(date);
                                    setFormData((prev) => ({
                                        ...prev,
                                        startDate: formatForApi(date)
                                    }));
                                    const maxDate = getMaxEndDate(date);
                                    if (date && (!endDateObj || date > endDateObj || (maxDate && endDateObj > maxDate))) {
                                        setEndDateObj(date);
                                        setFormData((prev) => ({
                                            ...prev,
                                            endDate: formatForApi(date)
                                        }));
                                    }
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                minDate={getYesterday()}
                                filterDate={isNotSunday}
                                className="w-full border rounded-xl px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold uppercase mb-2 block">
                                To *
                            </label>
                            <DatePicker
                                selected={endDateObj}
                                onChange={(date) => {
                                    setEndDateObj(date);
                                    setFormData((prev) => ({
                                        ...prev,
                                        endDate: formatForApi(date)
                                    }));
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                minDate={startDateObj || getYesterday()}
                                maxDate={startDateObj ? getMaxEndDate(startDateObj) : null}
                                filterDate={isNotSunday}
                                className="w-full border rounded-xl px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold uppercase mb-2 block">
                                Leave Type *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleOnChange}
                                className="w-full border rounded-xl px-3 py-2"
                                required
                            >
                                <option value="" disabled hidden>Select Leave</option>
                                <option value="Casual Leave">Casual Leave</option>
                                <option value="Earned Leave">Earned Leave</option>
                                <option value="Maternity Leave">Maternity Leave</option>
                                <option value="Restricted Holiday">Restricted Holiday</option>
                                <option value="Others">Others</option>
                            </select>

                            {formData.category === "Others" && (
                                <input
                                    type="text"
                                    name="otherCategory"
                                    value={formData.otherCategory}
                                    onChange={handleOnChange}
                                    placeholder="Specify leave type"
                                    className="w-full border rounded-xl px-3 py-2 mt-2"
                                    required
                                />
                            )}
                        </div>
                    </div>

                    {/* DAILY SCHEDULE */}
                    {Object.keys(substituteTeachers).length > 0 && (
                        <div className="border-t pt-6">
                            <h2 className="text-lg font-semibold mb-4">Daily Schedule</h2>
                            {Object.keys(substituteTeachers).map((dateStr) => (
                                <div key={dateStr} className="bg-gray-50 border rounded-xl p-4 mb-4">
                                    <div className="flex items-center gap-6 mb-3">
                                        <span className="font-semibold text-gray-700">{dateStr}</span>
                                        <span className="text-sm">Do you have class?</span>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="radio"
                                                    checked={substituteTeachers[dateStr].hasClass === "yes"}
                                                    onChange={() => handleClassRadio(dateStr, "yes")}
                                                /> Yes
                                            </label>
                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="radio"
                                                    checked={substituteTeachers[dateStr].hasClass === "no"}
                                                    onChange={() => handleClassRadio(dateStr, "no")}
                                                /> No
                                            </label>
                                        </div>
                                    </div>

                                    {substituteTeachers[dateStr].hasClass === "yes" && (
                                        <div className="flex flex-col gap-3 ml-2">
                                            {substituteTeachers[dateStr].periods.map((period, idx) => (
                                                <div key={idx} className="flex gap-3 relative items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Hour (e.g., 1)"
                                                        className="border rounded px-3 py-2 w-1/3"
                                                        value={period.hour}
                                                        onChange={(e) => handlePeriodChange(dateStr, idx, "hour", e.target.value)}
                                                        required
                                                    />
                                                    <div className="relative w-2/3">
                                                        <input
                                                            type="text"
                                                            placeholder="Select Substitute Teacher"
                                                            className={`border rounded px-3 py-2 w-full ${!period.substituteId && period.substitute.length > 0 ? 'border-red-400' : ''}`}
                                                            value={period.substitute}
                                                            onChange={(e) => {
                                                                handlePeriodChange(dateStr, idx, "substitute", e.target.value);
                                                                setActiveDropdown(`${dateStr}-${idx}`);
                                                            }}
                                                            onFocus={() => setActiveDropdown(`${dateStr}-${idx}`)}
                                                            onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                                            required
                                                        />
                                                        {activeDropdown === `${dateStr}-${idx}` && period.substitute.length > 0 && (
                                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                                                                {staffList
                                                                    .map(staff => ({ name: formatStaffName(staff), id: staff._id })) // Map name and MongoDB _id
                                                                    .filter(staff => staff.name.toLowerCase().includes(period.substitute.toLowerCase()))
                                                                    .map((staff, sIdx) => (
                                                                        <div
                                                                            key={sIdx}
                                                                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault();
                                                                                handlePeriodChange(dateStr, idx, "substitute", staff.name, staff.id);
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                        >
                                                                            {staff.name}
                                                                        </div>
                                                                    ))
                                                                }
                                                                {/* Restored "No Matches Found" */}
                                                                {staffList.filter(staff => formatStaffName(staff).toLowerCase().includes(period.substitute.toLowerCase())).length === 0 && (
                                                                    <div className="px-3 py-2 text-sm text-gray-500 italic">
                                                                        No matches found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Restored Remove Button */}
                                                    {substituteTeachers[dateStr].periods.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePeriod(dateStr, idx)}
                                                            className="text-red-500 text-sm font-semibold ml-2 whitespace-nowrap"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleAddPeriod(dateStr)}
                                                className="bg-gray-200 px-3 py-1 rounded text-sm w-max mt-1"
                                            >
                                                + Add Another Class
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FILE UPLOAD (Updated to handle local File objects) */}
                    <div className="flex flex-col gap-2 border-t pt-4">
                        <label className="text-sm font-semibold uppercase">Supporting Documents (Optional)</label>
                        <p className="text-sm text-gray-500">Attach medical certificates or other documents (e.g., PDF, Image)</p>
                        <label className="border-2 border-dashed border-blue-400 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-blue-50 transition">
                            <div className="text-blue-500 text-4xl">⬆</div>
                            <p className="text-blue-600 font-semibold">Click to select file <span className="text-gray-500 font-normal"> or drag and drop</span></p>
                            {/* Assumes backend expects max 1 file, based on the cURL */}
                            <input type="file" onChange={handleFileInput} className="hidden" />
                        </label>
                        <ul className="mt-2 space-y-2">
                            {attachments.map((file, idx) => (
                                <li key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                                    <span className="text-sm text-gray-700 truncate max-w-[80%] font-medium">📄 {file.name}</span>
                                    <button type="button" onClick={() => removeAttachment(idx)} className="text-xs text-red-500 font-semibold">Remove</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="flex justify-center pt-6">
                        <button
                            type="submit"
                            className={`px-8 py-3 rounded-xl text-white font-semibold ${!isFormValid() || loading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            disabled={!isFormValid() || loading}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewLeave;