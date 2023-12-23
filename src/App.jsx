import React, { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";

import "./App.css";

const stripePromise = loadStripe("pk_test_51OOUEIKWBynLeX49NJSeuX7VZuhH8iIkTRW29AN5YRSC53GQGwmGmwuciXb1NTo4Fp0aiHK5BfKLA64luwFDUeun00g5lI0UP4");

const CheckoutForm = () => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const requestBody = {
      package_type: ["3 months commitment fee",]
    };
  
    // Replace 'YOUR_JWT_TOKEN_HERE' with your actual JWT token.
    const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzAzOTQzMDAxLCJpYXQiOjE3MDMzMzgyMDEsImp0aSI6IjAyNmJkYzhjOGI3NDQ4ZGJhMzBjYjE2NjdlYWY0ZTdjIiwidXNlcl9pZCI6ImFkNDY2ODk4LTJjYmQtNDIxMi05YzEyLTVkZjdiZmVjYmNmZSIsImVtYWlsIjoiYWxhYmFyaXNlQGdtYWlsLmNvbSIsInJvbGUiOlsiSU5URVJOIl0sImhhc19jb21wbGV0ZWRfcHJvZmlsZSI6ZmFsc2UsImludGVybl9hc3NpZ25lZF90b19wcm9qZWN0IjpmYWxzZSwiaGFzX3Byb3ZpZGVkX2RvY3VtZW50cyI6ZmFsc2UsImhhc19wYWlkX2NvbW1pdG1lbnQiOmZhbHNlLCJpbnRlcm5fcHJvZmlsZV9zdGF0dXMiOiJQRU5ESU5HIiwiaW50ZXJuX3N1cGVydmlzb3JfbmFtZSI6bnVsbCwiaW50ZXJuX3N1cGVydmlzb3JfaW5zdGl0dXRpb24iOm51bGx9.Snrk7yIa14NLsgckofGNSWu1FQ53CRWsvNAHoqdz5iM";
  
    fetch("http://127.0.0.1:10050/api/v1/payment/initialize-intern-stripe-checkout-session/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`  // Add JWT token here
      },
      body: JSON.stringify(requestBody)
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setClientSecret(data.client_secret);
      } else {
        console.error("Stripe checkout session initialization failed:", data);
      }
    })
    .catch((error) => {
      console.error("Error initializing Stripe checkout session:", error);
    });
  }, []);
  

  return (
    <div id="checkout">
      {clientSecret && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  );
}

const Return = () => {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get('session_id');

    fetch(`/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setCustomerEmail(data.customer_email);
      });
  }, []);

  if (status === 'open') {
    return (
      <Navigate to="/checkout" />
    )
  }

  if (status === 'complete') {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to {customerEmail}.

          If you have any questions, please email <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </section>
    )
  }

  return null;
}

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/checkout" element={<CheckoutForm />} />
          <Route path="/return" element={<Return />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;