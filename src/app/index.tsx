import { View, Button, Alert, FlatList, Text } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import { Input } from "@/components/Input";
import { Cobranca } from "@/components/Cobranca";
import { useCobrancaDatabase, CobrancaDatabase } from "@/database/useCobrancaDatabase"; 
import { Status } from "@/components/Cobranca"; // Importando enum Status

export default function Index() {
    const [id, setId] = useState("");
    const [nome, setNome] = useState("");
    const [search, setSearch] = useState("");
    const [vencimento, setVencimento] = useState("");
    const [valor, setValor] = useState("");
    const [status, setStatus] = useState(Status.PENDENTE); // Status default é "PENDENTE"
    const [cobrancas, setCobrancas] = useState<CobrancaDatabase[]>([]);

    const cobrancaDatabase = useCobrancaDatabase();

    // Função para formatar o valor para 2 casas decimais
    const formatValue = (value: string) => {
        const formattedValue = parseFloat(value.replace(',', '.')).toFixed(2);
        return formattedValue;
    };

    // Função para criar uma nova cobrança
    async function create() {
        try {
            const formattedValue = formatValue(valor);
            if (isNaN(Number(formattedValue))) {
                return Alert.alert("Valores", "O valor precisa ser um número válido.");
            }
            const response = await cobrancaDatabase.create({ nome, vencimento, valor: parseFloat(formattedValue) });

            Alert.alert("Cobrança cadastrada com sucesso");
        } catch (error) {
            console.log(error);
        }
    }

    // Função para atualizar uma cobrança existente
    async function update() {
        try {
            const formattedValue = formatValue(valor);
            if (isNaN(Number(formattedValue))) {
                return Alert.alert("Valores", "O valor precisa ser um número válido.");
            }
            const response = await cobrancaDatabase.update({
                id: Number(id),
                nome,
                vencimento,
                valor: parseFloat(formattedValue),
                status: Number(status),
            });

            Alert.alert("Cobrança atualizada com sucesso");
        } catch (error) {
            console.log(error);
        }
    }

    // Função para listar as cobranças
    async function list() {
        try {
            const response = await cobrancaDatabase.searchByName(search);
            setCobrancas(response);
        } catch (error) {
            console.log(error);
        }
    }

    // Função para preencher os campos ao clicar na cobrança
	/*
	   Alert desenhado para evitar que os dados sejam carregados sem a necessidade de editar
	   Não sei se existe outra forma de fazer, mas assim dá certo... kkkkkkkkk
	*/
    function details(item: CobrancaDatabase) {
        if (item.status === Status.PAGO) {
            Alert.alert("Cobrança paga", "Você não pode editar uma cobrança já paga.");
            return;
        }

        Alert.alert(
            "Deseja editar esta cobrança?",
            "Você está prestes a editar uma cobrança.",
            [
                {
                    text: "Cancelar",
                    onPress: () => {},
                    style: "cancel",
                },
                {
                    text: "Confirmar",
                    onPress: () => {
                        setId(String(item.id));
                        setNome(item.nome);
                        setVencimento(item.vencimento);
                        setValor(String(item.valor));
                        setStatus(item.status);
                    },
                },
            ]
        );
    }

    // Função para salvar a cobrança (criar ou atualizar)
    async function handleSave() {
        if (id) {
            update();
        } else {
            create();
        }

        // Limpar os campos após salvar
        setId("");
        setNome("");
        setVencimento("");
        setValor("");
        setStatus(Status.PENDENTE);

        await list();
    }

    // Função para excluir uma cobrança
	// Mesma observação para o alert do editar
    async function remove(id: number) {
        Alert.alert(
            "Confirmar Exclusão",
            "Você tem certeza que deseja excluir esta cobrança?",
            [
                {
                    text: "Cancelar",
                    onPress: () => {},
                    style: "cancel",
                },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await cobrancaDatabase.remove(id);
                            await list();
                        } catch (error) {
                            console.log(error);
                        }
                    },
                },
            ]
        );
    }

    // Usamos useEffect para carregar as cobranças quando o componente é montado
    useEffect(() => {
        list();
    }, [search]);

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 16, gap: 16 }}>
            <View style={{
                backgroundColor: "#76c5db", 
                paddingVertical: 16, 
                marginBottom: 16,
                borderRadius: 8,
                alignItems: "center"
            }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
                    REGISTRO DE FINANÇAS
                </Text>
            </View>

            <Input placeholder="Nome" onChangeText={setNome} value={nome} />
            <Input
                placeholder="Vencimento (DD-MM-AAAA)"
                onChangeText={setVencimento}
                value={vencimento}
                keyboardType="numeric"
            />
            <Input
                placeholder="Valor (R$)"
                onChangeText={setValor}
                value={valor}
                keyboardType="decimal-pad"
            />

            <Button title="Salvar" onPress={handleSave} />

            <Input placeholder="Pesquisar" onChangeText={setSearch} />

            <FlatList
                data={cobrancas}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <Cobranca
                        data={item}
                        onEdit={() => details(item)}
                        onDelete={() => remove(item.id)}
                        onOpen={() => router.navigate(`/details/${String(item.id)}`)}
                    />
                )}
                ListEmptyComponent={<Text>Não há cobranças para exibir.</Text>}
                contentContainerStyle={{ gap: 5 }}
            />
        </View>
    );
}
