import { Navigate } from 'react-router-dom'; import { useMeQuery } from '../api';
export function ProtectedRoute({children}:{children:React.ReactNode}){const {isLoading,isError}=useMeQuery(); if(isLoading)return <div className="grid min-h-screen place-items-center text-maroon">Loading…</div>; if(isError)return <Navigate to="/login" replace/>; return children}

