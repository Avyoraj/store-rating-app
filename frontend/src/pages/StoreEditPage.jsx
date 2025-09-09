import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Store, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { storeAPI } from '../services/api';

const StoreEditPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current user's store profile
    const fetchStore = async () => {
      try {
        setLoading(true);
        const response = await storeAPI.getStore('me');
        setFormData({ ...response.data });
      } catch {
        setError("Failed to load store data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData) return 'Form not loaded.';
    const { name, email, address, city, state, zip_code } = formData;
    if (!name || name.length < 3 || name.length > 100) {
      return "Store name must be between 3 and 100 characters";
    }
    if (!email || !email.includes("@")) {
      return "Please enter a valid email address";
    }
    if (!address || address.length > 400) {
      return "Address is required and must be less than 400 characters";
    }
    if (!city || city.length > 50) {
      return "City is required and must be less than 50 characters";
    }
    if (!state || state.length > 50) {
      return "State is required and must be less than 50 characters";
    }
    if (!zip_code || zip_code.length > 10) {
      return "ZIP code is required and must be less than 10 characters";
    }
    if (formData.phone && formData.phone.length > 20) {
      return "Phone number must be less than 20 characters";
    }
    if (formData.website && formData.website.length > 255) {
      return "Website URL must be less than 255 characters";
    }
    if (formData.description && formData.description.length > 1000) {
      return "Description must be less than 1000 characters";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await storeAPI.updateStore('me', formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        navigate('/store/dashboard');
      } else {
        setError(response.error?.message || 'Failed to update store profile.');
      }
    } catch {
      setError("Failed to update store profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!formData) {
    return (
      <ProtectedRoute requiredRole="owner">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Store Found</h2>
            <p className="text-muted-foreground mb-4">You don't have a store associated with your account.</p>
            <Button>Contact Support</Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="owner">
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/store/dashboard">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Store className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Edit Store Profile</h1>
                <p className="text-muted-foreground">Update your store information and settings</p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Keep your store information up to date to help customers find and contact you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Store profile updated successfully!</AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Store Name *</Label>
                    <Input name="name" value={formData.name} onChange={handleChange} required minLength={3} maxLength={100} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input name="email" value={formData.email} onChange={handleChange} required type="email" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea name="address" value={formData.address} onChange={handleChange} required maxLength={400} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input name="city" value={formData.city} onChange={handleChange} required maxLength={50} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input name="state" value={formData.state} onChange={handleChange} required maxLength={50} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code *</Label>
                    <Input name="zip_code" value={formData.zip_code} onChange={handleChange} required maxLength={10} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input name="phone" value={formData.phone || ''} onChange={handleChange} maxLength={20} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input name="website" value={formData.website || ''} onChange={handleChange} maxLength={255} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea name="description" value={formData.description || ''} onChange={handleChange} maxLength={1000} />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                    {isSubmitting ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StoreEditPage;
