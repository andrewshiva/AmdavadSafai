import React, { useState, useEffect } from 'react';
import AppV1 from './v1/AppV1';
import AppV2 from './v2/AppV2';

export const App = () => {
  const [version, setVersion] = useState(() => {
    // 1. Check URL query param ?v=1 or ?v=2
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const vParam = params.get('v');
      if (vParam === '2' || vParam === 'v2') return 'v2';
      if (vParam === '1' || vParam === 'v1') return 'v1';

      // 2. Check Port detection (5182 = v2, 5180 = v1)
      if (window.location.port === '5182') return 'v2';
      if (window.location.port === '5180') return 'v1';

      // 3. Check LocalStorage preference
      const saved = localStorage.getItem('amdavad_safai_app_version');
      if (saved === 'v2' || saved === 'v1') return saved;
    }
    return 'v1';
  });

  const handleSwitchVersion = (targetVersion) => {
    const nextV = targetVersion || (version === 'v1' ? 'v2' : 'v1');
    setVersion(nextV);
    try {
      localStorage.setItem('amdavad_safai_app_version', nextV);
    } catch {
      // Ignore
    }
  };

  if (version === 'v2') {
    return <AppV2 onSwitchVersion={() => handleSwitchVersion('v1')} />;
  }

  return <AppV1 onSwitchVersion={() => handleSwitchVersion('v2')} />;
};

export default App;
