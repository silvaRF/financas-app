import { useSQLiteContext } from "expo-sqlite"

export type CobrancaDatabase = {
    id: number,
    nome: string,
    vencimento: string,
    valor: number,
    status: number
}

export function useCobrancaDatabase(){
    const database = useSQLiteContext()

    async function create(data: Omit<CobrancaDatabase, "id" | "status"> ) {
        const statement = await database.prepareAsync(
            "INSERT INTO cobrancas (nome, vencimento, valor, status) VALUES ($nome, $vencimento, $valor, 0)")

        try {
            const result = await statement.executeAsync(
                {
                    $nome: data.nome,
                    $vencimento: data.vencimento,
                    $valor: data.valor,
                }
            )
            const insertedRowId = result.lastInsertRowId.toString()

            return { insertedRowId }
            
        } catch (error) {
            throw error
        } finally{await statement.finalizeAsync()}
    }   

    async function update(data: CobrancaDatabase ) {
        const statement = await database.prepareAsync(
            "UPDATE cobrancas SET  nome = $nome, vencimento = $vencimento, valor = $valor where id = $id")

        try {
            await statement.executeAsync(
                {
                    $nome: data.nome,
                    $vencimento: data.vencimento,
                    $valor: data.valor,
                    $id: data.id
                }
            )
            
        } catch (error) {
            throw error
        } finally{await statement.finalizeAsync()}
    }
    
    async function updateStatus (id: number, status: number ) {
        console.log(status)
        const statement = await database.prepareAsync(
            "UPDATE cobrancas SET status = $status where id = $id")

        try {
            await statement.executeAsync(
                {
                    $id: id,
                    $status: status
                }
            )
            
        } catch (error) {
            throw error
        } finally{await statement.finalizeAsync()}
    }

    async function searchByName(nome: string) {
        try {
            const query = "SELECT * FROM cobrancas WHERE nome LIKE ?"

            const response = await database.getAllAsync<CobrancaDatabase>(query, `%${nome}%`)
            return response
        } catch (error) {
            throw error
        }
    }

    async function  remove(id: number) {

        const statement = await database.prepareAsync( "DELETE FROM cobrancas WHERE id = $id")

        try {
            await statement.executeAsync(
                {
                    $id: id
                }
            )
        }catch (error) {
            throw error
        } finally{await statement.finalizeAsync()}
    }  

    async function show(id: number) {
        try {
            const query = "SELECT * FROM cobrancas WHERE id =  ?"

            const response = await database.getFirstAsync<CobrancaDatabase>(query, id)
            return response
        } catch (error) {
            throw error
        }
        
    }

    return {create, searchByName, update, remove, show, updateStatus}
}