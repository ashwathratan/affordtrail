import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import axios from "axios";

const App = () => {
  const [inputs, setInputs] = useState([
    { longUrl: "", validity: "", shortcode: "", result: null, error: "" },
  ]);

  const [statsCode, setStatsCode] = useState("");
  const [statsData, setStatsData] = useState(null);
  const [statsError, setStatsError] = useState("");

  const handleChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  const addRow = () => {
    if (inputs.length < 5) {
      setInputs([
        ...inputs,
        { longUrl: "", validity: "", shortcode: "", result: null, error: "" },
      ]);
    }
  };

  const validateInput = ({ longUrl, validity, shortcode }) => {
    if (!longUrl.startsWith("http")) return "Invalid URL";
    if (validity && (!/^\d+$/.test(validity) || parseInt(validity) <= 0))
      return "Validity must be a positive integer";
    if (shortcode && !/^[a-zA-Z0-9]+$/.test(shortcode))
      return "Shortcode must be alphanumeric";
    return "";
  };

  const handleShorten = async (index) => {
    const input = inputs[index];
    const error = validateInput(input);
    if (error) {
      handleChange(index, "error", error);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/shorten", {
        originalUrl: input.longUrl,
        validity: input.validity ? parseInt(input.validity) : 30,
        shortcode: input.shortcode || undefined,
      });

      handleChange(index, "result", res.data);
      handleChange(index, "error", "");
    } catch (err) {
      handleChange(
        index,
        "error",
        err.response?.data?.error || "Something went wrong"
      );
    }
  };

  const fetchStats = async () => {
    if (!statsCode.trim()) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/stats/${statsCode}`
      );
      setStatsData(res.data);
      setStatsError("");
    } catch (err) {
      setStatsError("Shortcode not found or error fetching stats.");
      setStatsData(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        URL Shortener
      </Typography>

      {inputs.map((input, index) => (
        <Box
          key={index}
          component={Paper}
          elevation={3}
          sx={{ p: 2, mb: 2 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Original URL"
                value={input.longUrl}
                onChange={(e) =>
                  handleChange(index, "longUrl", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Validity (min)"
                value={input.validity}
                onChange={(e) =>
                  handleChange(index, "validity", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Custom Shortcode"
                value={input.shortcode}
                onChange={(e) =>
                  handleChange(index, "shortcode", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleShorten(index)}
              >
                Shorten
              </Button>
            </Grid>
          </Grid>

          {input.error && (
            <Typography color="error" mt={1}>
              {input.error}
            </Typography>
          )}
        </Box>
      ))}

      {inputs.length < 5 && (
        <Button variant="outlined" onClick={addRow} sx={{ mb: 4 }}>
          Add Another URL
        </Button>
      )}

      <Table component={Paper} sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell><b>Original URL</b></TableCell>
            <TableCell><b>Short URL</b></TableCell>
            <TableCell><b>Expiry (minutes)</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inputs
            .filter((i) => i.result)
            .map((input, idx) => (
              <TableRow key={idx}>
                <TableCell>{input.longUrl}</TableCell>
                <TableCell>
                  <a
                    href={input.result.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {input.result.shortUrl}
                  </a>
                </TableCell>
                <TableCell>{input.validity || 30}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Divider sx={{ my: 5 }} />

      {/* STATS SECTION */}
      <Typography variant="h5" gutterBottom>
        URL Stats Lookup
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Enter Shortcode"
          value={statsCode}
          onChange={(e) => setStatsCode(e.target.value)}
        />
        <Button variant="contained" onClick={fetchStats}>
          Get Stats
        </Button>
      </Box>

      {statsError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {statsError}
        </Typography>
      )}

      {statsData && (
        <Paper sx={{ p: 2 }}>
          <Typography><b>Original URL:</b> {statsData.original_url}</Typography>
          <Typography><b>Created At:</b> {statsData.created_at}</Typography>
          <Typography><b>Expires At:</b> {statsData.expires_at}</Typography>
          <Typography><b>Click Count:</b> {statsData.click_count}</Typography>

          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell><b>Timestamp</b></TableCell>
                <TableCell><b>Referrer</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsData.clicks.map((click, idx) => (
                <TableRow key={idx}>
                  <TableCell>{click.timestamp}</TableCell>
                  <TableCell>{click.referrer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default App;
