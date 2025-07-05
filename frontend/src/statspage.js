import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
} from "@mui/material";
import axios from "axios";

const StatsPage = () => {
  const [shortcode, setShortcode] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/stats/${shortcode}`);
      setStats(res.data);
      setError("");
    } catch (err) {
      setStats(null);
      setError("Shortcode not found or error fetching stats.");
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        📊 URL Stats Lookup
      </Typography>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <TextField
          label="Enter Shortcode"
          value={shortcode}
          onChange={(e) => setShortcode(e.target.value)}
        />
        <Button variant="contained" onClick={fetchStats}>
          Get Stats
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      {stats && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">🔗 Shortened URL Details</Typography>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><b>Shortcode</b></TableCell>
                <TableCell>{stats.shortcode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Original URL</b></TableCell>
                <TableCell>{stats.original_url}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Created At</b></TableCell>
                <TableCell>{new Date(stats.created_at).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Expires At</b></TableCell>
                <TableCell>{new Date(stats.expires_at).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Total Clicks</b></TableCell>
                <TableCell>{stats.click_count}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Typography variant="h6" mt={4}>
            🕓 Click Details
          </Typography>
          {stats.clicks.length === 0 ? (
            <Typography>No clicks recorded yet.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Timestamp</b></TableCell>
                  <TableCell><b>Referrer</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.clicks.map((click, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{click.referrer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default StatsPage;
