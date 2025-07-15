import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { getAllUsers } from "../../../../services/operations/commonAPI";
import SearchResultsList from "./SearchResultsList";
import { AiOutlineDelete } from "react-icons/ai";


const SubstituteTeacherBox = ({
    token,
    index,
    value,
    updateTeacher,
    deleteTeacher,
}) => {

    const [inputDisplayValue, setInputDisplayValue] = useState(value); // setting the value to display in input tag
    const [results, setResults] = useState([]); // Search result of staff when searched for substitute teacher

    // Searching in databse and filtering out required name from DB
    const handleSearch = async (searchQuery) => {
        // FETCH ALL USERS FROM THE DATABASE
        const allUsers = await getAllUsers(token);
        const searchResults = allUsers.data.users.filter((user) => {
            setInputDisplayValue(searchQuery)
            return (
                searchQuery &&
                (user.accountType.toLowerCase().includes("staff") ||
                    user.accountType.toLowerCase().includes("hod")) &&
                (user.firstName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                    user.lastName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) || ((user.firstName
                            .toLowerCase() +" "+ user.lastName.toLowerCase())
                            .includes(searchQuery.toLowerCase())))
            );
        });
        setResults(searchResults);
    };

    // Selecting the susbtitute teacher from search options
    const onSelectSubstituteTeacher = (newSubstituteTeacher) => {
        console.log("New Substitute Teacher: ", newSubstituteTeacher);
        setResults([])
        updateTeacher(index, newSubstituteTeacher);
        setInputDisplayValue(newSubstituteTeacher.firstName + " "+ newSubstituteTeacher.lastName)
    };


    // Deleting teacher value from teachersArray

    return (
        <div className="flex mt-4 gap-4">
            <div className="w-full">
                <div className="flex gap-2 items-center bg-white p-2 rounded-md">
                    <FaSearch className=" text-rnsit-blue" />
                    <input
                        type="text"
                        name="substituteTeacher"
                        id="substituteTeacher"
                        placeholder="Enter Name"
                        className=" bg-white outline-none w-full"
                        onChange={(e) => handleSearch(e.target.value)}
                        value={inputDisplayValue? inputDisplayValue:""}
                    />
                </div>
                <SearchResultsList
                    results={results}
                    onSelectSubstituteTeacher={onSelectSubstituteTeacher}
                />
            </div>
            <div className="flex flex-col justify-center text-xl">
                <AiOutlineDelete onClick={()=>deleteTeacher(index)} className="cursor-pointer"/>
            </div>
        </div>
    );
};

export default SubstituteTeacherBox;

