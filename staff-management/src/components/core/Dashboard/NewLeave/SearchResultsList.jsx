import React from "react";

const SearchResultsList = ({
    results,
    onSelectSubstituteTeacher,
}) => {
      /*TEST DATA

     const newResults = [
         {
            firstName: "John",
            lastName: "Doe",
        },
        {
    //         firstName: "Jane",
    //         lastName: "Doe",
    //     },
    //     {
    //         firstName: "John",
    //         lastName: "Smith",
    //     },
    //     {
    //         firstName: "John",
    //         lastName: "Doe",
    //     },
    //     {
    //         firstName: "Jane",
    //         lastName: "Doe",
    //     },
    //     {
    //         firstName: "John",
    //         lastName: "Smith",
    //     },
    // ];

    // console.log("Results: ", results);
*/

    return (
        results.length > 0 && (
            <div className=" overflow-y-scroll max-h-[200px] shadow-md">
                <ul className=" bg-white p-2 rounded-md">
                    {results.map((result, index) => (
                        <li
                            onClick={() => onSelectSubstituteTeacher(result)}
                            key={index}
                            className={`cursor-pointer hover:bg-gray-100 p-2 ${
                                index === 0 ? "" : "border-t"
                            }`}
                        >
                            {result.firstName + " " + result.lastName}
                        </li>
                    ))}
                </ul>
            </div>
        )
    );
};

export default SearchResultsList;
