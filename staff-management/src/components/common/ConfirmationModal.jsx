import React from 'react';

const ConfirmationModal = ({
  text1 = "Confirm Action",
  text2 = "Are you sure you want to proceed? This action cannot be undone.",
  btn1Text = "Cancel",
  btn2Text = "Confirm",
  btn1Handler,
  btn2Handler,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 w-screen h-screen backdrop-blur-md flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6'>
        <div className='flex flex-col gap-4'>
          <h3 className='text-xl font-semibold text-gray-800'>{text1}</h3>
          <p className='text-gray-600'>{text2}</p>
          
          <div className='flex justify-end gap-3 mt-4'>
            <button
              onClick={btn1Handler}
              className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors'
            >
              {btn1Text}
            </button>
            <button
              onClick={btn2Handler}
              className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
            >
              {btn2Text}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;