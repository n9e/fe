/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';

const OutOfService: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
      <h3 style={{ fontSize: 40 }}>
        The {import.meta.env.VITE_IS_ENT ? 'Flashcat' : 'Nightingale'} is <span style={{ color: 'red' }}>out of Service</span>
      </h3>
      <img src='/image/out-of-service.png' />
    </div>
  );
};

export default OutOfService;
