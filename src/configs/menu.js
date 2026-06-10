import { lazy } from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  ListFilter,
  History as HistoryIcon,
  Activity as ActivityIcon
} from 'lucide-react';

const DashboardPage = lazy(() => import('../pages/Dashboard/Dashboard'));
const UploadPage = lazy(() => import('../pages/UploadAndGrading/UploadAndGrading'));
const BatchPage = lazy(() => import('../pages/BatchSynchronization/BatchSynchronization'));
const HistoryPage = lazy(() => import('../pages/History/History'));
const AuditTrailPage = lazy(() => import('../pages/AuditTrail/AuditTrail'));

export const menu = [
  {
    title: 'Dashboard',
    path: '/',
    identifier: 'dashboard',
    icon: LayoutDashboard,
    component: DashboardPage,
  },
  {
    title: 'Upload & Grading',
    path: '/upload-grading',
    identifier: 'upload-grading',
    icon: UploadCloud,
    component: UploadPage,
  },
  {
    title: 'Batch Synchronization',
    path: '/batch-synchronization',
    identifier: 'batch-synchronization',
    icon: ListFilter,
    component: BatchPage,
  },
  {
    title: 'History',
    path: '/history',
    identifier: 'history',
    icon: HistoryIcon,
    component: HistoryPage,
  },
  {
    title: 'Audit Trail',
    path: '/audit-trail',
    identifier: 'audit-trail',
    icon: ActivityIcon,
    component: AuditTrailPage,
  },
];
