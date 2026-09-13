import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { EntryForm } from "./pages/EntryForm";
import { Statement } from "./pages/Statement";
import { Exports } from "./pages/Exports";
import { TransactionView } from "./pages/TransactionView";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="entries/new" element={<EntryForm />} />
          <Route path="entries/:id" element={<TransactionView />} />
          <Route path="entries/:id/edit" element={<EntryForm />} />
          <Route path="statement" element={<Statement />} />
          <Route path="exports" element={<Exports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
