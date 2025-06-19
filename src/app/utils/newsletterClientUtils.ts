// Interface for a successful subscription response
interface SubscribeResponse {
  message: string;
  id?: number;
}

// Interface for an error response
interface SubscribeError {
  message: string;
}

/**
 * Subscribes an email to the newsletter by sending a POST request to the /api/subscribe endpoint.
 * @param email - The email address to subscribe.
 * @returns A promise that resolves to a success or error response.
 */
export const subscribeToNewsletter = async ( email: string): Promise<SubscribeResponse | SubscribeError> => {
  try {
    // Send POST request to the server-side API route
    const response = await fetch('/api/subscribe-Pf1gHIWuGu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    // Parse the JSON response
    const data = await response.json();

    // If the response is OK, return the success message and id
    if (response.ok) {
      return { message: data.message || 'Subscription successful!', id: data.id };
    } else {
      // If not OK, return the error message
      return { message: data.message || 'An error occurred during subscription. Please try again.' };
    }
  } catch (error) {
    // Handle network or unexpected errors
    console.error('API Utility: Error submitting newsletter form:', error);
    return { message: 'Network error. Please try again later.' };
  }

};