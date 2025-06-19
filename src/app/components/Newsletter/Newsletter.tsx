"use client";
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { subscribeToNewsletter } from "../../utils/newsletterClientUtils"

export const Newsletter: React.FC = () => {

  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true); // Set loading state

    // Basic client-side email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    // Call the utility function to handle the API request
    const result = await subscribeToNewsletter(email);

    // Check the type of result to determine success or error
    if ('id' in result) { // If 'id' property exists, it's a success response
      toast.success(result.message)
      setEmail(''); // Clear email input on successful subscription
    } else { // Otherwise, it's an error response
      toast(result.message);
    }

    setIsSubmitting(false); // Reset loading state
  };

  return (
    <div className='flex justify-between items-center gap-4 mt-4'>
      <div className='flex flex-col gap-4 w-full xl:w-[50%] items-center'>
        <h1 className='text-2xl sm:text-4xl md:text-8xl font-bold'>Sign Up For The Newsletter</h1>
        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-4 items-center mt-0 xl:mt-4'>
          <input 
            type="email" 
            className='border-2 w-full rounded-sm p-4' 
            placeholder='Enter your email here'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <button className='social-links flex justify-center w-full' type='submit' disabled={isSubmitting}>
            {/* Arrow icon */}
            <svg fill="#2E2B2C" viewBox="0 0 24 24" className='w-8 h-8 md:w-10 md:h-10 xl:w-15 xl:h-15' xmlns="http://www.w3.org/2000/svg">
              <path d="M9.96973 9.02588C9.96973 8.61167 10.3055 8.27588 10.7197 8.27588H14.2798C14.694 8.27588 15.0298 8.61167
              15.0298 9.02588V15.3519L13.7725 14.4895C13.0056 13.9633 11.9939 13.9633 11.227 14.4895L9.96973 15.3519V9.02588Z"/>
              <path d="M12.5 2.15088C6.97715 2.15088 2.5 6.62803 2.5 12.1509C2.5 17.6737 6.97715 22.1509 12.5 22.1509C18.0228
              22.1509 22.5 17.6737 22.5 12.1509C22.5 6.62803 18.0228 2.15088 12.5 2.15088ZM10.7197 6.77588H14.2798C15.5224
              6.77588 16.5298 7.78324 16.5298 9.02588V16.7759C16.5298 17.0543 16.3756 17.3097 16.1293 17.4395C15.883
              17.5692 15.5851 17.5518 15.3555 17.3944L12.924 15.7264C12.6684 15.551 12.3312 15.551
              12.0755 15.7264L9.64398 17.3944C9.41442 17.5518 9.11652 17.5692 8.87022
              17.4395C8.62392 17.3097 8.46973 17.0543 8.46973 16.7759V9.02588C8.46973
              7.78324 9.47709 6.77588 10.7197 6.77588Z"/>
            </svg>
            <span className='font-bold text-3xl hidden lg:block'>Sign Up</span>
          </button>
        </form>
      </div>

      <div className='flex justify-center gap-12 border-2 p-18.5 w-full hidden xl:w-[50%] xl:flex'>
        <div className='flex flex-col gap-4'>
          <p>Every Monday</p>
          <h1 className='font-bold text-xl'>Weekly Dose of Deconstructed Code</h1>
          <p>Keep your coding knowledge sharp with a fresh delivery of my latest posts, featuring innovative solutions and clear concept deconstructions, arriving in your inbox each week.</p>
          <svg width="20" height="20" viewBox="0 0 24 25" className='tunes' fill="#2E2B2C" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.5 3.64062C18.799 3.64062 19.0844 3.69895 19.3454 3.80484L11.9299 11.2203L9.63761 8.92801C8.75893 8.04934
            7.33431 8.04935 6.45563 8.92803C5.57696 9.80671 5.57696 11.2313 6.45565 12.11L10.3389 15.9932C11.2176 16.8719
            12.6422 16.8719 13.5209 15.9932L20.75 8.76412V18.8906C20.75 20.1333 19.7426 21.1406 18.5
            21.1406H5.5C4.25736 21.1406 3.25 20.1333 3.25 18.8906V5.89062C3.25 4.64798 4.25736
            3.64062 5.5 3.64062H18.5Z"/>
            <path d="M20.4839 6.90924C20.7768 6.61634 20.7768 6.14147 20.4839 5.84858C20.191 5.55568 19.7162 5.55568
            19.4233 5.84858L11.9299 13.342L8.57696 9.98905C8.28406 9.69616 7.80919 9.69616 7.5163 9.98906C7.22341
            10.282 7.22341 10.7568 7.5163 11.0497L11.3996 14.9329C11.6925 15.2258 12.1673 15.2258
            12.4602 14.9329L20.4839 6.90924Z"/>
          </svg>
        </div>
        
        <div className='flex flex-col gap-4'>
          <p>Last Friday of the Month</p>
          <h1 className='font-bold text-xl'>The Month&apos;s Essential Code Recap</h1>
          <p>For a curated overview, subscribe to the monthly digest. It&apos;s a thoughtfully compiled recap of the most significant insights, detailed explanations, and standout discussions from the past four weeks.</p>
          <svg width="20" height="20" viewBox="0 0 24 25" className='tunes' fill="#2E2B2C" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.5 3.64062C18.799 3.64062 19.0844 3.69895 19.3454 3.80484L11.9299 11.2203L9.63761 8.92801C8.75893 8.04934
            7.33431 8.04935 6.45563 8.92803C5.57696 9.80671 5.57696 11.2313 6.45565 12.11L10.3389 15.9932C11.2176 16.8719
            12.6422 16.8719 13.5209 15.9932L20.75 8.76412V18.8906C20.75 20.1333 19.7426 21.1406 18.5
            21.1406H5.5C4.25736 21.1406 3.25 20.1333 3.25 18.8906V5.89062C3.25 4.64798 4.25736
            3.64062 5.5 3.64062H18.5Z"/>
            <path d="M20.4839 6.90924C20.7768 6.61634 20.7768 6.14147 20.4839 5.84858C20.191 5.55568 19.7162 5.55568
            19.4233 5.84858L11.9299 13.342L8.57696 9.98905C8.28406 9.69616 7.80919 9.69616 7.5163 9.98906C7.22341
            10.282 7.22341 10.7568 7.5163 11.0497L11.3996 14.9329C11.6925 15.2258 12.1673 15.2258
            12.4602 14.9329L20.4839 6.90924Z"/>
          </svg>
        </div>
      </div>

      
    </div>
  )
};