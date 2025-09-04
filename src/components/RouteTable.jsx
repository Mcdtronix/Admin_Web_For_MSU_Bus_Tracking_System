import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function RouteTable({ routes, onEdit, onDelete, onSuspend }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Suspended</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {routes.map((route) => (
          <TableRow key={route.id}>
            <TableCell>{route.name}</TableCell>
            <TableCell>{route.from_station}</TableCell>
            <TableCell>{route.to_station}</TableCell>
            <TableCell>{route.price}</TableCell>
            <TableCell>
              <Switch
                checked={route.suspended}
                onChange={() => onSuspend(route)}
              />
            </TableCell>
            <TableCell>
              <IconButton onClick={() => onEdit(route)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(route.id)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
