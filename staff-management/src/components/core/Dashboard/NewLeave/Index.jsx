import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import rnsLogo from "../../../../assets/images/rns-logo.webp";
import { FaSearch } from "react-icons/fa";
import { createLeave } from "../../../../services/operations/leaveAPI";
import SubstituteDayBox from "./SubstituteDayBox";

const NewLeave = () => {
    const [substituteTeachers, setSubstituteTeachers] = useState({});
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [substitutionBox, setSubstitutionBox] = useState(false);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        subject: "",
        body: "",
        startDate: null,
        endDate: null,
        category: "",
        substituteTeachers: substituteTeachers,
    });

    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };
    const { subject, body, startDate, endDate, category } = formData;
    const differenceMs = new Date(endDate) - new Date(startDate);
    const differenceDays =
        differenceMs / (1000 * 60 * 60 * 24) >= 0
            ? differenceMs / (1000 * 60 * 60 * 24) + 1
            : parseInt(0);
    console.log("Difference Days: ", differenceDays);

    const dayValueChanger = (day, newTeacherArray) =>{
        setSubstituteTeachers(prevSubTeachers => ({
            ...prevSubTeachers,
            ["Day"+day]: newTeacherArray
          }));
          console.log("All Teachers:",substituteTeachers)
    }


    // Update substituteTeachers state based on date changes
    useEffect(() => {
        if (differenceDays > 0) {
            const newSubstituteTeachers = {};
            for (let i = 0; i < differenceDays; i++) {
                newSubstituteTeachers[`Day${i + 1}`] = { teachers: [] };
            }
            setSubstituteTeachers(newSubstituteTeachers);
            // setSubstitutionBox(true)
            console.log("All Substitute Teachers: ", newSubstituteTeachers);
        }
    }, [startDate, endDate, differenceDays]);

    const handleOnSubmit = (e) => {
        e.preventDefault();
        console.log("Sub Teachers: ", substituteTeachers)
        console.log("form data:", formData);
        setLoading(true);
        try {
            dispatch(
                createLeave(subject, body, startDate, endDate, category, substituteTeachers, token)
            );
        } catch (e) {
            console.log("Error in creating leave: ", e);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col border p-5 bg-gray-100 gap-8 w-full rounded-md">
            <div className="flex justify-between text-3xl font-semibold">
                <img src={rnsLogo} alt="" className=" self-start w-10" />
                Leave Application
                <div></div>
            </div>
            <form onSubmit={handleOnSubmit} className=" flex flex-col gap-4">

                {/* SUBJECT */}
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="subject"
                        className=" text-sm font-semibold uppercase"
                    >
                        Subject<sup className=" text-pink-500"> *</sup>
                    </label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        placeholder="Enter Subject"
                        className=" bg-white px-4 py-2 rounded"
                        onChange={handleOnChange}
                    />
                </div>

                {/* BODY */}
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="body"
                        className=" text-sm font-semibold uppercase"
                    >
                        Detailed Reason<sup className=" text-pink-500"> *</sup>
                    </label>
                    <textarea
                        onChange={handleOnChange}
                        name="body"
                        id="body"
                        cols="40"
                        rows="10"
                        placeholder="Enter Detailed Reason"
                        className=" bg-white px-4 py-2 rounded"
                    ></textarea>
                </div>

                {/* DATES */}
                <div className="flex flex-row justify-between items-center">
                    <div className="flex gap-20">
                        <div className="flex flex-col">
                            <label
                                htmlFor="startdate"
                                className=" text-sm font-semibold uppercase"
                            >
                                From<sup className=" text-pink-500">*</sup>
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                id="startDate"
                                className=" max-w-max bg-transparent border text-gray-600 text-sm border-gray-200"
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label
                                htmlFor="endDate"
                                className=" text-sm font-semibold uppercase"
                            >
                                To<sup className=" text-pink-500">*</sup>
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                id="endDate"
                                className=" max-w-max bg-transparent border text-gray-600 text-sm border-gray-200 custom-inpt"
                                onChange={handleOnChange}
                            />
                        </div>
                    </div>

                    {/* LEAVE TYPE */}
                    <div>
                        <label
                            htmlFor="category"
                            className=" text-sm font-semibold uppercase"
                        >
                            Leave Type<sup className=" text-pink-500">*</sup>:{" "}
                        </label>
                        <select
                            name="category"
                            id="category"
                            className=" border border-gray-200 px-2 py-1"
                            onChange={handleOnChange}
                            defaultValue={"Select Leave Type"}
                        >
                            <option disabled>Select Leave Type</option>
                            <option value="Emergency Leave">
                                Emergency Leave
                            </option>
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                </div>

                {/* YES OR NO FOR PERIODS */}
                <div>
                    <div>
                        <h2>Do you have class on any of these days?</h2>
                        <div className="flex gap-4">
                            <input
                                type="radio"
                                name="class"
                                id="yes"
                                value="yes"
                                onClick={() => setSubstitutionBox(true)}
                            />
                            <label htmlFor="yes">Yes</label>
                            <input
                                type="radio"
                                name="class"
                                id="no"
                                value="no"
                                onClick={() => setSubstitutionBox(false)}
                            />
                            <label htmlFor="no">No</label>
                        </div>
                        {/* Substitute Teacher Box */}
                        {substitutionBox && (
                            <div>
                                <h2
                                    htmlFor="substituteTeachers"
                                    className=" text-sm font-semibold uppercase mt-4"
                                >
                                    Substitute Teacher
                                    <sup className=" text-pink-500">*</sup>
                                </h2>
                                {Object.keys(substituteTeachers).map((dayData, i) => (
                                    <SubstituteDayBox
                                        key={i}
                                        day={i+1}
                                        dayData={dayData}
                                        token={token}
                                        substituteTeachers={substituteTeachers}
                                        setSubstituteTeachers={setSubstituteTeachers}
                                        dayValueChanger={dayValueChanger}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mx-auto mt-4">
                    <button className="text-gray-100 font-semibold text-lg bg-rnsit-blue px-4 py-2 rounded-md">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewLeave;


// SAMPLE DATA OF SUBSTITUTE TEACHER

// const substitute Teachers data=
// [
//     // day 1:
//     day1:{
//         teachers:[
//             {teach1}, {teach2}
//         ]
//     },
//     // day 2:
//     day2:{
//         teachers:[
//             {teach1}, {teach2}
//         ]
//     }
// ]