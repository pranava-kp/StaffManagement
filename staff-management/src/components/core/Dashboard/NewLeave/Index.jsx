import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import rnsLogo from "../../../../assets/images/rns-logo.webp";
import { createLeave } from "../../../../services/operations/leaveAPI";

const NewLeave = () => {
    const [substituteTeachers] = useState({});
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

    // For calendar controlled values
    const [startDateObj, setStartDateObj] = useState(null);
    const [endDateObj, setEndDateObj] = useState(null);

    const getYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
    };

    const formatForApi = (dateObj) => {
        if (!dateObj) return "";
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`; // yyyy-mm-dd (local date, no UTC shift)
    };

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        const { subject, body, category, otherCategory } = formData;

        if (category === "Others" && !otherCategory.trim()) {
            alert("Please specify the leave type when selecting 'Others'");
            return;
        }

        const apiStartDate = formatForApi(startDateObj);
        const apiEndDate = formatForApi(endDateObj);

        setLoading(true);
        try {
            const result = await dispatch(
                createLeave(
                    subject,
                    body,
                    apiStartDate,
                    apiEndDate,
                    category === "Others" ? otherCategory : category,
                    substituteTeachers,
                    token
                )
            );

            console.log("createLeave result:", result);

            if (result?.success) {
                navigate("/dashboard/staff");
            }

        } catch (e) {
            console.log("Error in creating leave: ", e);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col border p-5 bg-gray-100 gap-8 w-full rounded-md">
            <div className="flex justify-between text-3xl font-semibold">
                <img src={rnsLogo} alt="" className="self-start w-10" />
                Leave Application
                <div></div>
            </div>
            <form onSubmit={handleOnSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="subject" className="text-sm font-semibold uppercase">
                        Subject<sup className="text-pink-500"> *</sup>
                    </label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        placeholder="Enter Subject"
                        className="bg-white px-4 py-2 rounded"
                        onChange={handleOnChange}
                        value={formData.subject}
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="body" className="text-sm font-semibold uppercase">
                        Detailed Reason<sup className="text-pink-500"> *</sup>
                    </label>
                    <textarea
                        onChange={handleOnChange}
                        name="body"
                        id="body"
                        cols="40"
                        rows="10"
                        placeholder="Enter Detailed Reason"
                        className="bg-white px-4 py-2 rounded"
                        value={formData.body}
                        required
                    ></textarea>
                </div>

                <div className="flex flex-row justify-between items-center">
                    <div className="flex gap-20">
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold uppercase">
                                From<sup className="text-pink-500">*</sup>
                            </label>
                            <DatePicker
                                selected={startDateObj}
                                onChange={(date) => {
                                    setStartDateObj(date);
                                    setFormData(prev => ({
                                        ...prev,
                                        startDate: formatForApi(date)
                                    }));
                                    if (date && (!endDateObj || date > endDateObj)) {
                                        setEndDateObj(date);
                                        setFormData(prev => ({
                                            ...prev,
                                            endDate: formatForApi(date)
                                        }));
                                    }
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                minDate={getYesterday()}
                                className="max-w-max bg-white border text-gray-600 text-sm border-gray-200 px-2 py-1"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold uppercase">
                                To<sup className="text-pink-500">*</sup>
                            </label>
                            <DatePicker
                                selected={endDateObj}
                                onChange={(date) => {
                                    setEndDateObj(date);
                                    setFormData(prev => ({
                                        ...prev,
                                        endDate: formatForApi(date)
                                    }));
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                minDate={startDateObj || getYesterday()}
                                className="max-w-max bg-white border text-gray-600 text-sm border-gray-200 px-2 py-1"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="category" className="text-sm font-semibold uppercase">
                            Leave Type<sup className="text-pink-500">*</sup>:
                        </label>
                        <select
                            name="category"
                            id="category"
                            className="border border-gray-200 px-2 py-1"
                            onChange={handleOnChange}
                            value={formData.category}
                            required
                        >
                            <option value="" disabled hidden>
                                Select Leave Type
                            </option>
                            <option value="Emergency Leave">Emergency Leave</option>
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Others">Others</option>
                        </select>

                        {formData.category === "Others" && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="otherCategory"
                                    id="otherCategory"
                                    placeholder="Specify leave type"
                                    className="bg-white px-4 py-2 rounded w-full"
                                    onChange={handleOnChange}
                                    value={formData.otherCategory}
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mx-auto mt-4">
                    <button
                        className="text-gray-100 font-semibold text-lg bg-rnsit-blue px-4 py-2 rounded-md"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewLeave;
