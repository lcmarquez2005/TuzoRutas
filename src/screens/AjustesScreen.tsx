import { Text } from "@/components/ui/text";
import { ScreenContent } from "./ScreenContent";
import { Button } from "@/components/ui/button";


export const AjustesScreen = () => (
    <ScreenContent path="screens/Ajustes.tsx">
        <Text className="mt-4 text-gray-600">Configuración de la app</Text>


// Contained button (default)
        <Button onPress={() => console.log('Pressed')}>Save</Button>

// Outlined variant
        <Button className='mt-4' variant="outline" onPress={() => console.log('Pressed')}>
            <Text>
                Cancel
            </Text>
        </Button>
        <Button className='mt-4' variant="default" onPress={() => console.log('Pressed')}>
            <Text>
                Cancel
            </Text>
        </Button>
        <Button className='mt-4' onPress={() => console.log('Pressed')}>
            <Text>
                Cancel
            </Text>
        </Button>
        <Button className='mt-4' variant="ghost" disabled onPress={() => console.log('Pressed')}>
            <Text>
                Cancel
            </Text>
        </Button>

    </ScreenContent>
);