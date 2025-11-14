"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddUserDrawer from "@/components/add-user-drawer";
import { Trash, Pencil } from "lucide-react";
import UpdateUserDrawer from "@/components/update-user-drawer";

export default function EmployeeManagementPage() {
    const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee>();



  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://inform-ai-backend.onrender.com";
  const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

  const getApiUrl = (path: string) => {
    if (USE_PROXY) return `/api/proxy${path}`;
    return `${API_BASE}${path}`;
  };

  interface Employee {
    _id: string;
    first_name: string;
    last_name: string;
    password: string;
    team_number: number;
    layout_coords: any;
    email: string;
    role: string;
    theme: string
  }
  const getUsers = async () => {
    const res = await fetch(getApiUrl("/user"), { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch users");

    const data = await res.json();
    console.log(data)
    setEmployees(data);
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(getApiUrl(`/user/${id}`), {
        method: "DELETE",
    });

    if (!res.ok) {
        console.error("Failed to delete user");
        return;
    }

    await getUsers(); // Refresh list after delete
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filtered = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const refresh = async () => await getUsers();

  return (
    <div className="p-6 space-y-6 w-full">
      {openDrawer && <AddUserDrawer closeDrawer={() => setOpenDrawer(false)} refresh={getUsers} />}

      <Card className="shadow-sm border rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Employee Management</CardTitle>
          <div className="flex gap-3">
            <Button onClick={() => setOpenDrawer(true)}>Add Employee</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Team Number</TableHead>
                  <TableHead className="text-right pr-29">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => (
                  <TableRow key={emp._id}>
                    <TableCell>
                        {(emp.first_name ?? "—") + " " + (emp.last_name ?? "")}
                    </TableCell>

                    <TableCell>
                        {emp.role ?? "—"}
                    </TableCell>

                    <TableCell>
                        {emp.email ?? "—"}
                    </TableCell>

                    <TableCell>
                        {emp.team_number ?? "—"}
                    </TableCell>

                    <TableCell className="text-right flex items-center gap-2 justify-end">
                      {/* Edit Button */}
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedUser(emp);
                          setShowUpdateDrawer(true); 
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 flex items-center gap-1 rounded-md"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>

                        {/* Delete Button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                              if (confirm("Are you sure you want to delete this user?")) {
                                  deleteUser(emp._id.toString());
                              }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                          Delete
                        </Button>

                    </TableCell>

                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm py-6 text-muted-foreground">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {showUpdateDrawer && (
        <UpdateUserDrawer
          user={selectedUser}
          closeDrawer={() => setShowUpdateDrawer(false)}
          refresh={refresh}
        />
      )}

    </div>
  );
}