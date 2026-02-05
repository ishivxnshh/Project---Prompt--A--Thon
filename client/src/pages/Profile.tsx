import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function Profile() {
    const { user, logout } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>View your personal account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{user?.name}</h2>
                            <p className="text-muted-foreground">Free Plan</p>
                        </div>
                    </div>

                    <div className="grid gap-4 mt-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Email Address</p>
                                <p className="font-medium">{user?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Member Since</p>
                                <p className="font-medium">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Account Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <p className="font-medium">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button variant="destructive" onClick={logout} className="w-full sm:w-auto">
                            Log out of all devices
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
