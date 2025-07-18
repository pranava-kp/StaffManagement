import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signUp } from "../../../../services/operations/authAPI";

const AddStaff = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const { firstName, lastName, email } = formData;

    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    // On Submit
    const handleOnSubmit = (e) => {
        e.preventDefault();
        dispatch(
            signUp(
                firstName,
                lastName,
                email,
                navigate
            )
        );

        // Reset
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
        });
    };

    return (
        <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md">
            <p className="border-b-2 w-full p-3 border-gray-300 text-xl font-semibold">New Staff</p>
            <form className="pb-4" onSubmit={handleOnSubmit}>
                <div className="flex flex-col gap-4">
                    {/* Input Fields */}
                    <div className="flex flex-col gap-4 mx-[10%]">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="firstName" className="text-sm font-medium uppercase">
                                First Name
                                <sup className="text-pink-500"> *</sup>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                id="firstName"
                                placeholder="First Name"
                                value={firstName}
                                onChange={handleOnChange}
                                className="px-4 py-2 min-w-[350px] bg-white border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="lastName" className="text-sm font-medium uppercase">
                                Last Name
                                <sup className="text-pink-500"> *</sup>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                id="lastName"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={handleOnChange}
                                className="px-4 py-2 min-w-[350px] bg-white border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="email" className="text-sm font-medium uppercase">
                                Email<sup className="text-pink-500"> *</sup>
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={handleOnChange}
                                className="px-4 py-2 min-w-[350px] bg-white border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-8 mr-[10%]">
                        <button
                            className="text-gray-100 font-medium text-sm bg-rnsit-blue px-4 py-2 rounded-md"
                            onClick={() => navigate("/dashboard/all-staffs")}
                            type="button"
                        >
                            Cancel
                        </button>
                        <button
                            className="text-gray-900 font-medium text-sm bg-rnsit-orange px-4 py-2 rounded-md"
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddStaff;