'use client';

import React, { useState } from 'react';
import Login from './Login/page';

export default function Home() {
  const [msg] = useState('Taha');

  return (
    <main>
      {/* Example of using msg */}
    
      <Login />
    </main>
  );
}
