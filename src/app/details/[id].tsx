import { View, Text, Button, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useCobrancaDatabase } from "@/database/useCobrancaDatabase";
import { Status } from "@/components/Cobranca";

export default function Details() {
    const [data, setData] = useState({
        nome: "",
        vencimento: "",
        valor: 0,
        status: Status.PENDENTE
    });

    const cobrancaDatabase = useCobrancaDatabase();
    const params = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        if (params.id) {
            cobrancaDatabase.show(Number(params.id)).then(response => {
                if (response) {
                    setData({
                        nome: response.nome,
                        vencimento: response.vencimento,
                        valor: response.valor,
                        status: response.status
                    });
                }
            });
        }
    }, [params.id]);

    // Função para lidar com o status
    async function handleStatus() {
        Alert.alert(
            "Confirmar Alteração",
            "Tem certeza que deseja alterar o status? Esta ação é irreversível.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        try {
                            await cobrancaDatabase.updateStatus(Number(params.id), Status.PAGO);
                            Alert.alert("Sua cobrança foi atualizada", "O status foi alterado para 'PAGO'.");
                            setData(prevState => ({ ...prevState, status: Status.PAGO }));
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            ]
        );
    }

    // Cor de fundo com base no status
    const backgroundColor = data.status === Status.PAGO ? "#8CE338" : "#CB4725";

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
            <View style={{
                backgroundColor: "#76c5db", 
                paddingVertical: 16, 
                marginBottom: 16,
                borderRadius: 8,
                alignItems: "center"
            }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
                    DETALHAMENTO DE CONTA
                </Text>
            </View>

            {/* Informações dentro de uma borda */}
            <View style={{
                backgroundColor: "#fff", 
                padding: 16, 
                borderRadius: 10, 
                borderWidth: 1, 
                borderColor: "#ddd",
                marginBottom: 20
            }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ fontSize: 18 }}>ID:</Text>
                    <Text style={{ fontSize: 18 }}>{params.id}</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ fontSize: 18 }}>NOME:</Text>
                    <Text style={{ fontSize: 18 }}>{data.nome}</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ fontSize: 18 }}>VENCIMENTO:</Text>
                    <Text style={{ fontSize: 18 }}>{data.vencimento}</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ fontSize: 18 }}>VALOR:</Text>
                    <Text style={{ fontSize: 18 }}>R$ {data.valor}</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ fontSize: 18 }}>STATUS:</Text>
                    <Text style={{ fontSize: 18 }}>{data.status === Status.PAGO ? 'PAGO' : 'PENDENTE'}</Text>
                </View>
            </View>

            {/* Mensagem com fundo dinâmico */}
            <View style={{
                backgroundColor,
                padding: 12,
                borderRadius: 10,
                marginBottom: 20,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Text style={{ fontSize: 18, color: "#fff", textAlign: "center" }}>
                    {data.status === Status.PAGO 
                        ? 'Tudo certo por aqui!\nUma conta a menos para se preocupar.' 
                        : 'Conta pendente!\nAguardando pagamento...'}
                </Text>
            </View>

            {/* Botão para pagar a conta */}
            <Button
                title="Pagar Conta"
                onPress={handleStatus}
                disabled={data.status !== Status.PENDENTE} // Desabilita o botão se o status não for 'PENDENTE'
            />
        </View>
    );
}
