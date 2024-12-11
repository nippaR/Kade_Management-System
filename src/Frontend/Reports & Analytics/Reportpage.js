import { Box, Grid, Stack, Typography } from "@mui/material";
import React from "react";



import bgImage from "../../images/kade2.png";

const Reportpage = () => {
    return(
        	
        <Grid sx={
            {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100%',
                backgroundColor: 'white',
            }
        }>
             <Box
                sx={{
                    border: '1px solid black', 
                    padding: 2, 
                    borderRadius: 1, 
                    backgroundColor: 'purple', 
                    width: '70%',
                    height: '100%',
                    my: 10,
                }}
            >
            <Stack spacing={12} direction="row" sx={{
                gap: 70,
            }}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h4" align="center" color="white">Sales Report</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <img src={bgImage} alt="bgImage" style={{ width: "150px" }}/>
                </Grid>
            </Stack>
            <hr/>
            <Stack spacing={12} direction="row" sx={{
                gap: 70,
            }}>
                <Grid item xs={12} sm={6}>
                    <Typography color="white">Contact Us : Kade.lk@gmail.com</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography color="white">Tel : 119</Typography>
                </Grid>
            </Stack>
            <hr/>
            <Stack spacing={12} direction="row" sx={{
                gap: 70,
            }}>
                <Grid item xs={12} sm={6}>
                    <Typography color="white">Report No: </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography color="white">Issued Date: </Typography>
                </Grid>
            </Stack>
            </Box>
        </Grid>
    )
    }

export default Reportpage;