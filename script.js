// Atividade 1 - Calendário de feriados com a BrasilAPI
// Aluno(a): ________________________

const campoAno = document.getElementById('ano')
const tabela = document.getElementById('tabelaFeriados')
const tabelaCompleta = document.getElementById('tabela')
const mensagem = document.getElementById('mensagem')
const total = document.getElementById('total')
const proximo = document.getElementById('proximo')
const botao = document.getElementById('btnConsultar')

const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// Preenche o campo com o ano atual.
campoAno.value = new Date().getFullYear()

function consultarFeriados() {
    const ano = campoAno.value.trim()

    tabela.innerHTML = ''
    tabelaCompleta.hidden = true
    mensagem.textContent = ''
    mensagem.classList.remove('erro')
    total.textContent = ''
    proximo.textContent = ''
    proximo.hidden = true

    if (!/^\d{4}$/.test(ano)) {
        mensagem.textContent = 'Digite um ano válido com quatro dígitos.'
        mensagem.classList.add('erro')
        return
    }

    mensagem.textContent = 'Carregando feriados...'
    botao.disabled = true

    fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error('Não foi possível consultar os feriados desse ano.')
            }
            return resposta.json()
        })
        .then(feriados => {
            if (!Array.isArray(feriados)) {
                throw new Error('A API devolveu uma resposta inválida.')
            }

            mensagem.textContent = ''
            total.textContent = `Total de feriados em ${ano}: ${feriados.length}`

            const hoje = new Date()
            const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
            let proximoFeriado = null
            let diasParaProximo = Infinity

            feriados.forEach(feriado => {
                // O horário de meio-dia evita problemas com fuso horário.
                const data = new Date(feriado.date + 'T12:00:00')
                const dataFormatada = data.toLocaleDateString('pt-BR')
                const numeroDoDia = data.getDay()
                const diaDaSemana = diasDaSemana[numeroDoDia]

                const linha = document.createElement('tr')

                if (numeroDoDia === 0 || numeroDoDia === 6) {
                    linha.classList.add('fim-de-semana')
                }

                const colunaData = document.createElement('td')
                colunaData.textContent = dataFormatada

                const colunaDia = document.createElement('td')
                colunaDia.textContent = diaDaSemana

                const colunaNome = document.createElement('td')
                colunaNome.textContent = feriado.name

                linha.appendChild(colunaData)
                linha.appendChild(colunaDia)
                linha.appendChild(colunaNome)
                tabela.appendChild(linha)

                // Calcula quantos dias faltam, sem influência de fuso horário.
                const dataUTC = Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
                const diasRestantes = (dataUTC - hojeUTC) / (1000 * 60 * 60 * 24)

                if (diasRestantes >= 0 && diasRestantes < diasParaProximo) {
                    diasParaProximo = diasRestantes
                    proximoFeriado = feriado
                }
            })

            tabelaCompleta.hidden = false
            proximo.hidden = false

            if (proximoFeriado) {
                const data = new Date(proximoFeriado.date + 'T12:00:00')
                const dataFormatada = data.toLocaleDateString('pt-BR')
                const prazo = diasParaProximo === 0
                    ? 'é hoje!'
                    : `faltam ${diasParaProximo} dia${diasParaProximo === 1 ? '' : 's'}`

                proximo.textContent = `Próximo feriado: ${proximoFeriado.name} (${dataFormatada}) — ${prazo}`
            } else {
                proximo.textContent = 'Não há mais feriados futuros no ano consultado.'
            }
        })
        .catch(erro => {
            mensagem.textContent = `Erro: ${erro.message}`
            mensagem.classList.add('erro')
        })
        .finally(() => {
            botao.disabled = false
        })
}

botao.addEventListener('click', consultarFeriados)
campoAno.addEventListener('keydown', evento => {
    if (evento.key === 'Enter') {
        consultarFeriados()
    }
})
