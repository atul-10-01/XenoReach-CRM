import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {!user ? (
        <GoogleLogin
          onSuccess={credentialResponse => {
            console.log('Google token:', credentialResponse.credential);
            setUser(credentialResponse);
          }}
          onError={() => {
            console.error('Login Failed');
          }}
        />
      ) : (
        <h1 className="text-2xl">Welcome, you’re logged in!</h1>
      )}
    </div>
  );
}

export default App;
