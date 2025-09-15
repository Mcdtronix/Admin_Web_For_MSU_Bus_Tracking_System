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
          <TableCell>From Station</TableCell>
          <TableCell>To Station</TableCell>
          <TableCell>Distance (km)</TableCell>
          <TableCell>Duration (min)</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Active</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {routes.map((route) => (
          <TableRow key={route.id}>
            <TableCell>{route.name}</TableCell>
            <TableCell>{route.from_station_name || route.from_station}</TableCell>
            <TableCell>{route.to_station_name || route.to_station}</TableCell>
            <TableCell>{route.distance}</TableCell>
            <TableCell>{route.estimated_duration}</TableCell>
            <TableCell>${route.price}</TableCell>
            <TableCell>
              <Switch
                checked={route.is_active}
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
