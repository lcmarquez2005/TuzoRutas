
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { View, StyleSheet, Text } from 'react-native';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { ScreenContent } from '@/screens/ScreenContent'; // Ajusta la ruta

const RutasScreen = () => {
    // Coordenadas de Pachuca de Soto, Hidalgo

    return (
        <ScreenContent path=''  >


            <Card className="w-full max-w-sm mt-10 ">
                <CardHeader className="flex-row">
                    <View className="flex-1 gap-1.5">
                        <CardTitle className='h2'>Subscribe to our newsletter</CardTitle>
                        <CardDescription>Enter your details to receive updates and tips</CardDescription>
                    </View>
                </CardHeader>
                <CardContent>
                    <View className="w-full justify-center gap-4">
                        <View className="gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" placeholder="m@example.com" />
                        </View>
                        <View className="gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="John Doe" />
                        </View>
                    </View>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button className='mt-4' variant={'outline'} onPress={() => console.log('Pressed')}>
                        <Text>Later</Text>
                    </Button>
                    <Button className='mt-4' variant={'link'} onPress={() => console.log('Pressed')}>
                        <Text>Later</Text>
                    </Button>
                    <Button className='mt-4' variant={'default'} onPress={() => console.log('Pressed')}>
                        <Text>Later</Text>
                    </Button>
                </CardFooter>
            </Card>
        </ScreenContent>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default RutasScreen;
