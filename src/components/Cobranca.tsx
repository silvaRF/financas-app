import { Pressable, PressableProps, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";


export enum Status {
    PENDENTE = 0,
    PAGO = 1
  }

type Props = PressableProps & {
    data: {
        nome: string,
        vencimento: string,
        valor: number,
        status: Status
    }
    onEdit: () => void;
    onDelete: () => void;
    onOpen: () => void;
}



// Status: {data.status === Status.PAGO ? 'Pago' : 'Pendente'}

export function Cobranca({data, onEdit, onDelete, onOpen, ...rest}: Props){

    return (
        <Pressable style={{ backgroundColor: "#CECECE", padding: 24, borderRadius: 5, gap: 12, flexDirection: "row",}} {...rest}>
            <Text style={{ flex: 1}}>
                {data.nome}
            </Text>
            <Text> 
                {data.status === Status.PAGO ? 'Pago' : 'Pendente'}
            </Text>
            <TouchableOpacity onPress={onEdit}>
                <MaterialIcons name="edit" size={24} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
                <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpen}>
                <MaterialIcons name="visibility" size={24} color="blue" />
            </TouchableOpacity>
        </Pressable>
    )
} 