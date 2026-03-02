import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import PetsRounded from "@mui/icons-material/PetsRounded";
import { createPet, deletePet, getPetsForOwner, updatePet } from "../../api/pet.api";
import type { Pet } from "../../types/pet.types";
import AddPetDialog from "../../components/pets/AddPetDialog";
import EditPetDialog from "../../components/pets/EditPetDialog";

const cardStyle = {
  height: "100%",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "grey.200",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  overflow: "hidden",
  position: "relative" as const,
  display: "flex",
  flexDirection: "column",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 20% 80%, rgba(13, 148, 136, 0.04) 0%, transparent 50%)",
    pointerEvents: "none",
  },
};

export default function OwnerPetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getPetsForOwner();
      setPets(list);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Failed to load pets.";
      setError(message);
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleAddPet = async (pet: Parameters<typeof createPet>[0]) => {
    return await createPet(pet);
  };

  const handleEditClick = (pet: Pet) => {
    setSelectedPet(pet);
    setEditDialogOpen(true);
  };

  const handleUpdatePet = async (id: string, data: Parameters<typeof updatePet>[1]) => {
    await updatePet(id, data);
  };

  const handleDeletePet = async (id: string) => {
    await deletePet(id);
    fetchPets();
  };

  return (
    <Box sx={{ maxWidth: 1200, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600} color="grey.900">
          My Pets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setDialogOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#0d9488",
            "&:hover": { bgcolor: "#0f766e" },
          }}
        >
          Add a Pet
        </Button>
      </Box>

      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      ) : pets.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You haven&apos;t added any pets yet. Click &quot;Add a Pet&quot; to get started.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {pets.map((pet) => (
            <Card key={pet.id} sx={cardStyle}>
              <CardContent sx={{ p: 3, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(13, 148, 136, 0.08)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    {pet.profile_photo_url ? (
                      <Box
                        component="img"
                        src={pet.profile_photo_url}
                        alt={pet.name}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <PetsRounded sx={{ fontSize: 32, color: "#0d9488" }} />
                    )}
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="grey.900" gutterBottom>
                    {pet.name}
                  </Typography>
                  <Typography variant="body2" color="grey.600">
                    {pet.species}
                    {pet.breed ? ` · ${pet.breed}` : ""}
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    {pet.sex ? `${pet.sex}` : ""}
                    {pet.weight_baseline != null ? ` · ${pet.weight_baseline} kg` : ""}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<EditRounded />}
                    onClick={() => handleEditClick(pet)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: "#0d9488",
                      "&:hover": { bgcolor: "#0f766e" },
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <AddPetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={fetchPets}
        onSubmit={handleAddPet}
      />

      <EditPetDialog
        open={editDialogOpen}
        pet={selectedPet}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedPet(null);
        }}
        onSaved={fetchPets}
        onUpdate={handleUpdatePet}
        onDelete={handleDeletePet}
      />
    </Box>
  );
}
