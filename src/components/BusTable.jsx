import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Switch } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function BusTable({ buses, onEdit, onDelete, onPublish }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>License Plate</TableCell>
          <TableCell>Capacity</TableCell>
          <TableCell>Published</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {buses.map(bus => (
          <TableRow key={bus.id}>
            <TableCell>{
              bus.plate_number ??
              bus.license_plate ??
              bus.plateNumber ??
              bus.licensePlate ??
              bus.license ??
              bus.plate ??
              '-'
            }</TableCell>
            <TableCell>{bus.capacity}</TableCell>
            <TableCell>
              <Switch checked={bus.published} onChange={() => onPublish(bus)} />
            </TableCell>
            <TableCell>
              <IconButton onClick={() => onEdit(bus)}><EditIcon /></IconButton>
              <IconButton onClick={() => onDelete(bus.id)}><DeleteIcon /></IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}