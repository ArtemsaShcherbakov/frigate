import { EModalType } from './modals/modals.constants';

interface IInspection {
  smpId: string;
  authorityId: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedDuration: string;
}

interface IInspectionResponse extends IInspection {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  smpName: string;
  authorityName: string;
}

interface IPagination {
  total: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
}

interface ILoadInspectionsResponse {
  success: boolean;
  data: IInspectionResponse[];
  pagination: IPagination;
}

interface IControlAuthority {
  id: string;
  nameAuthority: string;
}

interface IControlAuthorityResponse {
  success: boolean;
  list: IControlAuthority[];
}

interface IDeleteInspectionResponse {
  success: boolean;
  deleted_id: string;
}

interface IAddOrEditInspectionResponse {
  success: boolean;
  data: IInspectionResponse;
}

interface IModalDataService {
  type: (typeof EModalType)[keyof typeof EModalType];
  inspection?: IInspectionResponse;
}

export type {
  IModalDataService,
  IControlAuthorityResponse,
  IDeleteInspectionResponse,
  IAddOrEditInspectionResponse,
  IInspection,
  IInspectionResponse,
  ILoadInspectionsResponse,
  IPagination,
  IControlAuthority,
};
