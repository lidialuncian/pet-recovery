import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function OwnerPlansPage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" fontWeight={600} color="grey.900" gutterBottom>
        Care Plans
      </Typography>
      <Typography variant="body2" color="grey.600">
        Your care plans and recovery updates will appear here. This page is under construction.
      </Typography>
    </Box>
  );
}
