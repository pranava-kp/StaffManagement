import React, { useEffect, useState } from "react";
import SubstituteTeacherBox from "./SubstituteTeacherBox";

const SubstituteDayBox = ({ day, token, dayValueChanger}) => {
    const [periods, setPeriods] = useState(1);

    // One teachersArray is for one day
    const [teachersArray, setTeachersArray] = useState(
        Array.from({ length: periods })
    );
    const increasePeriods = (e) => {
        e.preventDefault();
        setPeriods(periods + 1);
    };

    useEffect(() => {
        setTeachersArray(prevArray => {
            const newArray = Array.from({ length: periods });
            return prevArray.slice(0, periods).concat(newArray.slice(prevArray.length));
        });
    }, [periods]);

    const updateTeacher = (index, newValue) => {
        // Create a new array with the updated value
        const updatedArray = [...teachersArray];
        updatedArray[index] = newValue;
        setTeachersArray(updatedArray);
        dayValueChanger(day, updatedArray)
    };
    const deleteTeacher = (index)=>{
        let updatedArray = [...teachersArray]
        updatedArray.splice(index, 1);
        setTeachersArray(updatedArray)
        dayValueChanger(day, updatedArray)
    }

    return (
        <div className="flex flex-col my-4 gap-4 w-full mb-12">
            <div className="flex justify-between">
                <h2>Day {day}:</h2>
                <button onClick={increasePeriods}>+</button>
            </div>
            <div className="ml-[40px]">
                {teachersArray.map((teacherName, i) => (
                    <SubstituteTeacherBox
                        key={i}
                        index={i}
                        token={token}
                        value={teacherName}
                        updateTeacher={updateTeacher}
                        deleteTeacher={deleteTeacher}
                    />
                ))}
            </div>
        </div>
    );
};

export default SubstituteDayBox;
