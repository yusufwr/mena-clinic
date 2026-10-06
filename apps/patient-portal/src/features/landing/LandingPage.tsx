import React from "react";
import { HeroSection } from "./HeroSection";
import { DepartmentGrid } from "./DepartmentGrid";
import { DoctorsShowcase, DoctorData } from "./DoctorsShowcase";
import { ClinicFeatures } from "./ClinicFeatures";

interface LandingPageProps {
  doctors: DoctorData[];
  onOpenBooking: (preselectedDoctor?: DoctorData, preselectedDept?: string) => void;
  onExploreDepartments: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  doctors,
  onOpenBooking,
  onExploreDepartments,
}) => {
  return (
    <div className="min-h-screen">
      <HeroSection
        onOpenBooking={() => onOpenBooking()}
        onExploreDepartments={onExploreDepartments}
      />
      <DepartmentGrid
        onSelectDepartment={(deptId) => onOpenBooking(undefined, deptId)}
      />
      <DoctorsShowcase
        doctors={doctors}
        onSelectDoctorForBooking={(doc) => onOpenBooking(doc)}
      />
      <ClinicFeatures />
    </div>
  );
};
