

exports.becameSubstituteTeacher = (startDate, dayToAdd, name, absentTeacherName) => {

    const dateString = startDate; // Last day of May

    // Function to add one day to a given date string
    const addDay = (dateStr) => {
      // Parse the date string into a Date object
      const date = new Date(dateStr);
      
      // Increment the date by one day
      date.setDate(date.getDate() + Number(dayToAdd));
      
      // Format the Date object back to a string (YYYY-MM-DD)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };
    
    // Add one day to the dateString
    const newDateString = addDay(dateString);


    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Assignment as Substitute Teacher</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <div class="message">Assignment as substitute teacher</div>
            <div class="body">
                <p>Hey ${name}</p>
                <p>You've been assisgned as substitute teacher on <span class="highlight"> ${newDateString}</span>.
                </p>
                <p>Please contact ${absentTeacherName} for further information.</p>
            </div>
            <div class="support"> This is an auto-generated mail, please don't reply on this Email.
            </div>
        </div>
    </body>
    
    </html>`;
};
