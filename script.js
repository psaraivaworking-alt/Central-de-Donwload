// script.js

// Este script será executado o mais cedo possível, pois está no <head> com 'defer'.

// --- Função para inicializar o Lazy Loading em todas as imagens (exceto a logo principal) ---
// Esta função é executada imediatamente para preparar o DOM.
(function prepareImagesForLazyLoad() {
    const allImgs = document.querySelectorAll('img');
    const placeholderSrc = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Um pixel transparente

    allImgs.forEach(img => {
        // Ignora a logo principal do cabeçalho para que ela carregue normalmente e apareça imediatamente.
        // Se houver outras imagens que você não quer que sejam lazy-loaded, adicione-as aqui.
        if (img.src && !img.src.includes('nova_logo.png') && !img.dataset.src) {
            img.setAttribute('data-src', img.src); // Guarda o caminho real da imagem
            img.src = placeholderSrc; // Define um pixel transparente como src
            img.classList.add('lazy'); // Adiciona uma classe para fácil identificação
        }
    });
})();


// --- Lógica principal executada após o DOM estar completamente carregado ---
// O atributo 'defer' garante que este código só rode após todo o HTML ser parseado,
// mas antes do evento DOMContentLoaded ser disparado e antes que o navegador
// comece a carregar recursos pesados como imagens.
document.addEventListener("DOMContentLoaded", function() {

    // --- Função para carregar imagens com Intersection Observer ---
    function lazyLoadImages(container) {
        // Seleciona apenas as imagens marcadas como 'lazy' dentro do contêiner fornecido
        const lazyImages = container.querySelectorAll('img.lazy');

        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        if (lazyImage.dataset.src) { // Garante que há um src para carregar
                            lazyImage.src = lazyImage.dataset.src; // Carrega a imagem real
                            lazyImage.onload = () => { // Opcional: Remover a classe 'lazy' quando a imagem é carregada
                                lazyImage.classList.remove('lazy');
                                // Você pode adicionar aqui uma classe para animar a imagem aparecendo, se desejar
                                // lazyImage.classList.add('loaded');
                            };
                            lazyImage.onerror = () => {
                                console.error('Failed to load image:', lazyImage.dataset.src);
                                // Opcional: Atribuir uma imagem de erro ou placeholder
                                lazyImage.src = 'path/to/error-placeholder.png'; 
                                lazyImage.classList.remove('lazy');
                            };
                            observer.unobserve(lazyImage); // Para de observar esta imagem
                        }
                    }
                });
            }, {
                rootMargin: '0px 0px 100px 0px' // Começa a carregar 100px antes de entrar na viewport
            });

            lazyImages.forEach(lazyImage => {
                lazyImageObserver.observe(lazyImage);
            });
        } else {
            // Fallback para navegadores sem Intersection Observer (navegadores muito antigos)
            // Carrega todas as imagens de uma vez para estes navegadores.
            lazyImages.forEach(lazyImage => {
                if (lazyImage.dataset.src) {
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazy');
                }
            });
            console.warn('Intersection Observer not supported. Images loaded directly.');
        }
    }


    // --- Lógica dos Botões de Toggle (Expandir/Recolher Seções) ---
    const buttons = document.querySelectorAll(".toggle-button");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target");
            const targetContent = document.getElementById(targetId);
            const allContents = document.querySelectorAll(".content");

            if (targetContent.classList.contains("active")) {
                // Se o conteúdo já está ativo, desativa
                targetContent.classList.remove("active");
            } else {
                // Desativa todos os outros conteúdos antes de ativar o clicado
                allContents.forEach(content => content.classList.remove("active"));
                targetContent.classList.add("active");

                // Carrega as imagens da seção que acabou de ser ativada
                lazyLoadImages(targetContent);
            }
        });
    });

    // --- Prioridade no Carregamento: Imagens das Seções Inicialmente Ativas ---
    // Mesmo que suas seções comecem fechadas por padrão com seu CSS,
    // se você decidir que alguma seção deve começar 'active',
    // este bloco garantirá que as imagens dela sejam lazy-loaded imediatamente no carregamento.
    const initiallyActiveContents = document.querySelectorAll(".content.active");
    initiallyActiveContents.forEach(content => {
        lazyLoadImages(content);
    });

    // Para garantir que as imagens que não estão dentro de um "content"
    // (como a logo do cabeçalho, que já excluída pelo prepareImagesForLazyLoad)
    // ou se você tiver outras imagens fora dos toggles,
    // elas também seriam lazy-loaded por uma chamada global, se necessário.
    // Como a preparação já aconteceu no topo do script,
    // e o IntersectionObserver lida com isso, não precisamos de uma chamada 'lazyLoadImages(document)' aqui,
    // a menos que você tenha imagens que não são lazy e não foram excluídas no 'prepareImagesForLazyLoad'.
    
    // Se você tiver *qualquer* imagem que não esteja em um ".content" e que você queira lazy-load,
    // e que a função 'prepareImagesForLazyLoad' acima não a tenha preparado, você faria algo assim:
    // lazyLoadImages(document); // Isso processaria todas as imagens no documento, mas pode ser redundante/ineficiente
                               // se você já preparou tudo com 'prepareImagesForLazyLoad'.
                               // A abordagem atual foca em carregar apenas as imagens das seções ativas.
});