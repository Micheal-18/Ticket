import React from 'react'

const Contact = () => {
    return (
        <section className='min-h-screen flex items-center justify-center py-20'>
            <div className='px-4 w-100 md:w-150'>
                <h1 className='text-3xl text-[#eeeeee] font-bold mb-6'>Contact Us</h1>
                <form className='flex flex-col gap-4'>
                    <div data-aos="fade-up" className='relative'>
                        <input type="text" placeholder='Your Name' className='p-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500' />
                    </div>
                    <div data-aos="fade-up" className='relative'>
                        <input type="email" placeholder='Your Email' className='p-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500' />
                    </div>
                    <div data-aos="fade-up" className='relative'>
                        <textarea id='message' rows='6' placeholder='Your Message' className='p-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full'></textarea>
                    </div>

                    <button className='bg-orange-500 p-2 rounded-md active:scale-90'>Send</button>
                </form>
            </div>
        </section>
    )
}

export default Contact