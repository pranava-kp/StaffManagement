import React from 'react'

const ConfirmationModal = ({text1, text2, btn1Text, btn2Text, btn1Handler, btn2Handler}) => {
  return (
    <div className='w-screen h-screen backdrop-blur-md flex justify-center items-center'>
        <div className='w-[70%] h-[70%] flex flex-col'>
            <div className=' bg-white w-full h-[20px]'></div>
        </div>
    </div>
  )
}

export default ConfirmationModal