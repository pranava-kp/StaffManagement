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
            <p className=" border-b-2 w-full p-3 border-gray-300">New Staff</p>
            <form className=" pb-4" onSubmit={handleOnSubmit}>
                <div className=" flex flex-col gap-4">
                    {/* Input Fields */}
                    <div className=" flex flex-col gap-2 mx-[10%]">
                        <div className=" flex flex-col">
                            <label htmlFor="firstName" className="uppercase">
                                First Name
                                <sup className=" text-pink-500"> *</sup>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                id="firstName"
                                placeholder="First Name"
                                onChange={handleOnChange}
                                className="px-4 py-2 min-w-[350px]"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="lastName" className="uppercase">
                                Last Name
                                <sup className=" text-pink-500"> *</sup>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                id="lastName"
                                placeholder="Last Name"
                                onChange={handleOnChange}
                                className="px-4 py-2 min-w-[350px]"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="email" className="uppercase">
                                Email<sup className=" text-pink-500"> *</sup>
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Email"
                                onChange={handleOnChange}
                                className="px-4 py-2 min-w-[350px]"
                            />
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-8 mr-4">
                        <button
                            className="text-gray-100 font-semibold text-lg bg-rnsit-blue px-4 py-2 rounded-md"
                            onClick={() => navigate("/dashboard/all-staffs")}
                        >
                            Cancel
                        </button>
                        <button
                            className="text-gray-900 font-medium text-lg bg-rnsit-orange px-4 py-2 rounded-md"
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
