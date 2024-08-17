export interface ContactVerificationInfo {
  name: string | undefined;
  phone: string | undefined;
  email: string | undefined;
}

export interface OrganizationConsistentAdditionalInfo {
  type: "consistent";
  details: Record<string, never>;
}

export interface OrganizationRotatingAdditionalInfo {
  type: "rotating";
  details: {
    ageCutOff: number;
  };
}

export interface OrganizationSchoolAdditionalInfo {
  type: "school";
  details: {
    gradeCutOff: number;
    startDate: string;
    endDate: string;
  };
}

export interface OrganizationMemberConsistentAdditionalInfo {
  type: "consistent";
  details: Record<string, never>;
}
export interface OrganizationMemberRotatingAdditionalInfo {
  type: "rotating";
  details: {
    age: number;
    birthday: string;
  };
}

export interface OrganizationMemberSchoolAdditionalInfo {
  type: "school";
  details: {
    studentId: string;
    grade: number;
  };
}

export type OrganizationMemberAdditionalInfo =
  | OrganizationMemberConsistentAdditionalInfo
  | OrganizationMemberRotatingAdditionalInfo
  | OrganizationMemberSchoolAdditionalInfo;

export type OrganizationAdditionalInfo =
  | OrganizationConsistentAdditionalInfo
  | OrganizationRotatingAdditionalInfo
  | OrganizationSchoolAdditionalInfo;
