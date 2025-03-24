import React, { useState } from 'react';
import axios from 'axios';
import {
  ToggleButtonGroup, 
  ToggleButton,
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  AppBar,
  Toolbar,
  Box,
  Paper,
  Fade,
  Grid,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from './assets/logo.png';

const AppLogo = styled('img')(({ theme }) => ({
  width: '120px',
  marginRight: theme.spacing(2),
  cursor: 'pointer',
}));

const FormContainer = styled('form')(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexDirection: 'column',
  maxWidth: '500px',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const SectionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  //textTransform: 'none',
  padding: theme.spacing(1, 3),
  backgroundColor: '#FF6B6B',
  borderRadius: '25px',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#FF4C4C',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  '&:disabled': {
    backgroundColor: '#FF6B6B',
    opacity: 0.6,
  },
}));

const TransitionBox = styled(Fade)(({ theme }) => ({
  transition: 'opacity 1s ease-out',
}));

const ToggleButtonStyled = styled(ToggleButton)(({ theme }) => ({
  borderRadius: '15px',
  padding: theme.spacing(1),
  fontWeight: 'bold',
  backgroundColor: '#E8F5E9',
  '&:hover': {
    backgroundColor: '#B2DFDB',
  },
}));

function App() {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [clothingRecommendation, setClothingRecommendation] = useState(null);
  const [restaurants, setRestaurants] = useState(null);
  const [activities, setActivities] = useState(null);
  const [units, setUnits] = useState('metric');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const fetchRecommendation = async (e) => {
    e.preventDefault();
    if (!location) {
      setError('Location is required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await axios.get(`https://weather-wardrobe-d8hnh5dvafdjb6ch.centralus-01.azurewebsites.net/recommendations/${location}?units=${units}`);
      const data = response.data;
      setWeatherData(data.weather);
      setClothingRecommendation(data.clothingRecommendation);
    } catch (error) {
      setError('Unable to fetch data. Please try again later.');
      setClothingRecommendation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRestaurantsAndActivities = async () => {
    if (!location) {
      setError('Location is required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await axios.get(`https://weather-wardrobe-d8hnh5dvafdjb6ch.centralus-01.azurewebsites.net/restaurants-activities/${location}`);
      const data = response.data;
      setRestaurants(data.restaurants);
      setActivities(data.activities);
    } catch (error) {
      setError('Unable to fetch restaurant and activity data.');
      setRestaurants(null);
      setActivities(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnitsChange = (event, newUnits) => {
    if (newUnits !== null) {
      setUnits(newUnits);
    }
  };

  const handleLogoClick = () => {
    setLocation('');
    setWeatherData(null);
    setClothingRecommendation(null);
    setRestaurants(null);
    setActivities(null);
    setUnits('metric');
    setError('');
    setDate('');
    setTime('');
  };

  return (
    <Container maxWidth="md" sx={{ bgcolor: '#F9F9F9', minHeight: '100vh', padding: 3 }}>
      <AppBar position="static" sx={{ bgcolor: '#FFFFFF', boxShadow: 'none', borderBottom: '1px solid #E0E0E0' }}>
        <Toolbar>
          <IconButton onClick={handleLogoClick} sx={{ p: 0 }}>
            <AppLogo src={logo} alt="Logo" />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
            Weather-Based Recommendations
          </Typography>
        </Toolbar>
      </AppBar>

      <FormContainer onSubmit={fetchRecommendation}>
        <TextField
          label="Enter a Location"
          variant="outlined"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ backgroundColor: '#FFFFFF' }}
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Select Date (Optional)"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ backgroundColor: '#FFFFFF' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Select Time (Optional)"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ backgroundColor: '#FFFFFF' }}
            />
          </Grid>
        </Grid>
        <StyledButton type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Get Recommendations'}
        </StyledButton>
        <StyledButton sx={{ marginTop: 2, marginBottom: 4 }} variant="contained" onClick={fetchRestaurantsAndActivities} disabled={isLoading}>
        Get Restaurants & Activities
      </StyledButton>
      </FormContainer>

      <Box sx={{ marginTop: 2, textAlign: 'center' }}>
        <ToggleButtonGroup value={units} exclusive onChange={handleUnitsChange} aria-label="temperature units">
          <ToggleButtonStyled value="metric">°C</ToggleButtonStyled>
          <ToggleButtonStyled value="imperial">°F</ToggleButtonStyled>
        </ToggleButtonGroup>
      </Box>

      <TransitionBox in={!isLoading && clothingRecommendation} timeout={1000}>
        <Box marginTop={4}>
          <SectionContainer elevation={3}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D3557', marginBottom: 2 }}>Weather Description</Typography>
            <Typography variant="body1">{weatherData?.fullDescription}</Typography>
          </SectionContainer>
          <SectionContainer elevation={3}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D3557', marginBottom: 2 }}>Clothing Recommendations</Typography>
            {clothingRecommendation?.clothingRecommendations.map((item, index) => (
              <Paper key={index} elevation={3} sx={{ marginBottom: 2, padding: 2, backgroundColor: '#FF6B6B', borderRadius: '8px' }}>
                <Typography variant="subtitle1" sx={{ color: '#FFFFFF' }}>{item.item}</Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{item.description}</Typography>
              </Paper>
            ))}
          </SectionContainer>
        </Box>
      </TransitionBox>

      

      <TransitionBox in={!isLoading && restaurants} timeout={1000}>
        <SectionContainer elevation={3} sx={{ marginTop: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D3557', marginBottom: 2 }}>Restaurants</Typography>
          {restaurants?.map((restaurant, index) => (
            <Paper key={index} elevation={3} sx={{ marginBottom: 2, padding: 2, backgroundColor: '#A4D8F3', borderRadius: '8px' }}>
              <Typography variant="subtitle1">{restaurant.name}</Typography>
              <Typography variant="body2">{restaurant.address}</Typography>
              <Typography variant="body2">Rating: {restaurant.rating}</Typography>
            </Paper>
          ))}
        </SectionContainer>
      </TransitionBox>

      <TransitionBox in={!isLoading && activities} timeout={1000}>
        <SectionContainer elevation={3} sx={{ marginTop: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D3557', marginBottom: 2 }}>Activities</Typography>
          {activities?.map((activity, index) => (
            <Paper key={index} elevation={3} sx={{ marginBottom: 2, padding: 2, backgroundColor: '#A4D8F3', borderRadius: '8px' }}>
              <Typography variant="subtitle1">{activity.name}</Typography>
              <Typography variant="body2">{activity.description}</Typography>
            </Paper>
          ))}
        </SectionContainer>
      </TransitionBox>
    </Container>
  );
}

export default App;
