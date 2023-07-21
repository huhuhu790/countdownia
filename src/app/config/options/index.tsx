import { ListItem, List, Paper, Typography, TextField } from "@mui/material";
import { useState } from "react";

export default function OptionsPage() {
    const [fontsize, setFontsize] = useState(0)
    return (
        <Paper
            elevation={2}
            sx={{
                py: 4,
                px: 10,
                height: "100%",
                overflow: "auto"
            }}
        >
            <List sx={{ width: "100%" }}>
                <ListItem>
                    <Typography>FontSize</Typography>
                    <TextField
                        value={fontsize}
                        onChange={(e) => {
                            const value = Number(e.target.value)
                            if (!Number.isNaN(value)) setFontsize(value)
                        }}
                    />
                </ListItem>
                <ListItem>
                    <Typography>Color</Typography>
                </ListItem>
            </List>
        </Paper>
    )
}