import React from 'react';
import { OnboardingProvider } from './OnboardingProvider';
import OnboardingFlow from './OnboardingFlow';

const OnboardingWrapper = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

export default OnboardingWrapper;
