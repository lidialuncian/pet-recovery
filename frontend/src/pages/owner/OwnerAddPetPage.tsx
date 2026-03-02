import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function OwnerAddPetPage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" fontWeight={600} color="grey.900" gutterBottom>
        Add a Pet
      </Typography>
      <Typography variant="body2" color="grey.600">
        The form to add a new pet will be available here. This page is under construction.
      </Typography>
    </Box>
  );
}
