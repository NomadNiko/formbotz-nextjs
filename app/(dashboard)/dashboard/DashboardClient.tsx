'use client';

import { Button } from 'flowbite-react';
import { HiQuestionMarkCircle } from 'react-icons/hi';
import { useDashboardTour } from '@/lib/hooks/useDashboardTour';

export default function DashboardClient() {
  const { startTour } = useDashboardTour();

  return (
    <Button color="light" onClick={startTour}>
      <HiQuestionMarkCircle className="mr-2 h-5 w-5" />
      Take Tour
    </Button>
  );
}
