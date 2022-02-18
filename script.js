function createElement(element, className, value) {
    const elem = document.createElement(element)
    elem.classList.add(className)
    elem.innerHTML = value
    return elem
}
function createImage(className, src) {
    const img = document.createElement('img')
    img.classList.add(className)
    img.src = src
    return img
}

function getElement(element) {
    return document.querySelector(element)
}
// **********************************************************
// **********************************************************

/* função executada ao clicar no btn de pesquisa*/
function pesquisar(){
    const termo = document.getElementById('textbox').value
    getData(termo) // busca os dados na API do MercadoLivre
    init() // atualiza a e tela e refaz a paginação
}

/* Dados advindo da API do MercadoLivre*/
async function getData(termo) {
    const promise = fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${termo}`);
    promise.then((response) => // função anônima para receptar o sucesso do request
        response.json()) // extração do JSON da resposta, o qual retorna outra promisse
        .then((jsonData) => { // função anônima para receptar a resposta assíncrona do JSON com os dados dos produtos
            console.log(jsonData.results)
            list.data = jsonData.results
            state.totalPaginas = Math.ceil(list.data.length / maxItensPorPagina)
            init()
        })
        .catch((response) => // função anônima para receptar o erro do request
            alert(`Nada encontrado. Erro ${response}`))
        .finally(() => {
        
        });

}


// **********************************************************
// **********************************************************

/* Estrutura que representa o estado da paginação */
const maxItensPorPagina = 6;
const state = {
    pagina: 1,
    maxItensPorPagina,
    totalPaginas: 0,
    maxBtnVisiveis: 5,
}

/* Controle - grupo de funções que irão controlar a paginação */
const controls = {
    next() { // fnc para a próxima página
        if (state.pagina < state.totalPaginas
        )
            state.pagina++;
    },
    goTo(pagina) { // fnc para uma página específica
        if (pagina < 1)
            state.pagina = 1
        else if (pagina > state.totalPaginas
        )
            state.pagina = state.totalPaginas

        else
            state.pagina = pagina
    },
    prev() { // fnc para a página anterior
        if (state.pagina > 1)
            state.pagina--;
    },
    createListeners() { // coloca os eventos nos botões da paginação
        getElement('.first').addEventListener('click',
            (e) => { this.goTo(1); list.update(); buttons.update() })
        getElement('.prev').addEventListener('click',
            (e) => { this.prev(); list.update(); buttons.update() })
        getElement('.next').addEventListener('click',
            (e) => { this.next(); list.update(); buttons.update() })
        getElement('.last').addEventListener('click',
            (e) => { this.goTo(state.totalPaginas); list.update(); buttons.update() })
    }
}

/* conjunto de operações específicas da lista paginada */
const list = {
    data:0,
    create(items) {
        const listElement = getElement('.list')
        items.map((each) => {
            /* Cria cada item a ser colocado na lista */
            const item = createElement('div', 'item', '')
            /* Cria a imagem e coloca dentro do item */
            const img = createImage('itemThumb',each.thumbnail)
            img.style.width = '200px';
            item.appendChild(img);
            /* Cria a titulo e coloca dentro do item */
            const title = createElement('h2', 'itemTitle', each.title)
            item.appendChild(title)
            /* Cria o preço e coloca dentro do item */
            const priceValue = `R$${each.price}`
            const price = createElement('h1', 'itemPrice', priceValue)
            item.appendChild(price)
            /* Coloca o item na lista */
            listElement.appendChild(item)
        })
    },
    update() {
        // zera a lista paginada
        getElement('.list').innerHTML = ""
        const inicio = state.maxItensPorPagina * (state.pagina - 1);
        const fim = inicio + state.maxItensPorPagina
        this.create(list.data.slice(inicio, fim))
    },
}

/* conjunto de operações específicas dos botões da paginação */
const buttons = {
    create(btnNum) {
        const numbersElement = getElement('.numbers')
        // define uma classe diferente para o btn que tem o numero da página (selecionado)
        const className = btnNum == state.pagina ? 'selected' : 'number'
        const btn = createElement('div', className, btnNum)
        btn.addEventListener('click', () => {
            state.pagina = btnNum; list.update(); buttons.update()
        })
        numbersElement.appendChild(btn)
    },
    update() {
        // zera a os botões numéricos da paginação
        getElement('.pagination .numbers').innerHTML = ""
        // constrói os botões da paginação
        const { esquerda, direita } = this.calculaMaxBtns()
        for (let btnNum = esquerda; btnNum <= direita; btnNum++) {
            this.create(btnNum) // constroi cada um dos botões da paginação
        }
    },
    calculaMaxBtns() { // calcula a qtd de botões na paginação
        const { maxBtnVisiveis } = state
        // calcula a menor e a maior página a ser exibida na paginação, a patir da página atual
        let esquerda = state.pagina - Math.floor(maxBtnVisiveis / 2);
        let direita = state.pagina + Math.floor(maxBtnVisiveis / 2);

        if (esquerda < 1) { // correção para páginas menores que 3
            esquerda = 1
            direita = maxBtnVisiveis
        } if (direita > state.totalPaginas) { // correção para páginas menores que 3
            direita = state.totalPaginas
            esquerda = state.totalPaginas - maxBtnVisiveis + 1
            if (esquerda < 1) esquerda = 1
        }
        return { esquerda, direita }
    }
}

function init() {
    list.update() // atualiza a lista
    buttons.update() // atualiza os botões numéricos da paginação
    // adiciona os eventos nos botões da paginação
    controls.createListeners()
}
