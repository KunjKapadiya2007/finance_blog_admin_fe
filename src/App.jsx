// src/App.jsx
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Snackbar, Alert, Box, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardMedia, Chip, Avatar,
  Fade, Slide, useTheme, alpha, Tooltip, Divider
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Article as ArticleIcon,
  Image as ImageIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

import BlogDialog from '../src/blogDialog';
import { getBlogs, createBlog, updateBlog, deleteBlog } from './api';

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

const App = () => {
  const theme = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewBlog, setViewBlog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);

  const [formData, setFormData] = useState({
    title: '', content: '', image: null, type: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (msg, severity = 'success') => {
    setSnackbar({ open: true, message: msg, severity });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenDialog = (blog = null) => {
    setIsEditing(!!blog);
    setCurrentBlog(blog);
    setFormData(blog ? {
      title: blog.title,
      content: blog.content,
      image: blog.image || null,
      type: blog.type
    } : { title: '', content: '', image: null, type: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentBlog(null);
    setFormData({ title: '', content: '', image: null, type: '' });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        showSnackbar('Title is required', 'error');
        return;
      }

      if (isEditing && currentBlog) {
        await updateBlog(currentBlog._id, formData);
        showSnackbar('Blog updated');
      } else {
        await createBlog(formData);
        showSnackbar('Blog created');
      }

      handleCloseDialog();
      fetchBlogs();
    } catch (error) {
      console.error('Save error:', error);
      const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Error saving blog';
      showSnackbar(message, 'error');
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await getBlogs();
      setBlogs(data);
    } catch {
      showSnackbar('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteBlog(id);
      showSnackbar('Blog deleted');
      fetchBlogs();
    } catch {
      showSnackbar('Failed to delete blog', 'error');
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const getTypeChipColor = (type) => {
    const colors = {
      'tech': 'primary',
      'lifestyle': 'secondary',
      'travel': 'success',
      'food': 'warning',
      'fashion': 'error',
      'health': 'info'
    };
    return colors[type?.toLowerCase()] || 'default';
  };

  return (
      <Box sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 4
      }}>
        <Container maxWidth="xl">
          <Fade in timeout={800}>
            <Paper elevation={0} sx={{
              p: 4,
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(50%, -50%)'
              }
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <DashboardIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                      Blog Admin Panel
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Manage your content with style
                    </Typography>
                  </Box>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      },
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      px: 3,
                      py: 1.5
                    }}
                >
                  Create New Blog
                </Button>
              </Box>
            </Paper>
          </Fade>

          {loading ? (
              <Fade in timeout={1200}>
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}>
                  <CircularProgress size={60} thickness={4} />
                  <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                    Loading your amazing content...
                  </Typography>
                </Paper>
              </Fade>
          ) : (
              <Slide direction="up" in timeout={1000}>
                <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        }}>
                          {['Title', 'Type', 'Content Preview', 'Image', 'Actions'].map(header => (
                              <TableCell key={header} sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 3 }}>
                                {header}
                              </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {blogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                <Box>
                                  <ArticleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary">
                                    No blogs available yet
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Create your first blog to get started!
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                        ) : blogs.map((blog) => (
                            <TableRow
                                key={blog._id}
                                sx={{
                                  '&:nth-of-type(even)': {
                                    bgcolor: alpha(theme.palette.grey[100], 0.5)
                                  }
                                }}
                            >
                              <TableCell sx={{ py: 3 }}>
                                <Typography variant="h6" fontWeight="600" color="primary.main">
                                  {blog.title}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 3 }}>
                                <Chip
                                    label={blog.type}
                                    color={getTypeChipColor(blog.type)}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      fontWeight: 'bold',
                                      borderRadius: 2
                                    }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 3, maxWidth: 300 }}>
                                <Typography variant="body2" color="text.secondary" sx={{
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: 1.4
                                }}>
                                  {stripHtml(blog.content || '').slice(0, 100)}...
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 3 }}>
                                {blog.image ? (
                                    <Avatar
                                        src={blog.image}
                                        alt={blog.title}
                                        variant="rounded"
                                        sx={{
                                          width: 60,
                                          height: 60,
                                          border: `2px solid ${theme.palette.primary.main}`
                                        }}
                                    />
                                ) : (
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                          width: 60,
                                          height: 60,
                                          bgcolor: alpha(theme.palette.grey[300], 0.5),
                                          color: 'text.secondary'
                                        }}
                                    >
                                      <ImageIcon />
                                    </Avatar>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 3 }}>
                                <Box display="flex" gap={1}>
                                  <Tooltip title="View Blog" arrow>
                                    <IconButton
                                        onClick={() => { setViewBlog(blog); setViewOpen(true); }}
                                        sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), '&:hover': { bgcolor: theme.palette.info.main, color: 'white' } }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Blog" arrow>
                                    <IconButton
                                        onClick={() => handleOpenDialog(blog)}
                                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: theme.palette.primary.main, color: 'white' } }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Blog" arrow>
                                    <IconButton
                                        onClick={() => handleDelete(blog._id)}
                                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { bgcolor: theme.palette.error.main, color: 'white' } }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Slide>
          )}

          <BlogDialog
              open={dialogOpen}
              onClose={handleCloseDialog}
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              isEditing={isEditing}
          />

          <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white', py: 3
            }}>
              <Typography variant="h5" fontWeight="bold">{viewBlog?.title}</Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {viewBlog?.image && (
                  <Card>
                    <CardMedia component="img" height="300" image={viewBlog.image} alt={viewBlog.title} sx={{ objectFit: 'cover' }} />
                  </Card>
              )}
              <Box sx={{ p: 3 }}>
                <Chip label={viewBlog?.type} color={getTypeChipColor(viewBlog?.type)} sx={{ mb: 2, fontWeight: 'bold' }} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  {stripHtml(viewBlog?.content || '')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
              <Button onClick={() => setViewOpen(false)} variant="contained" sx={{ borderRadius: 2, px: 3 }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
  );
};

export default App;
