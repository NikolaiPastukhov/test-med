const modal = document.querySelector(".modal");
const modalOverlay = document.querySelector(".modal-overlay");
const artistsList = document.createElement('div');
artistsList.classList.add('artist-list');
const catalogWindow = document.querySelector('.catalog');
const favoriteWindow = document.querySelector('.favorite');
const favoritesList = document.createElement('div');
favoritesList.classList.add('favorites-list');
const favoriteListEmpty = document.createElement('div');
favoriteListEmpty.classList.add('favorite-empty');
favoriteListEmpty.innerHTML = ` 
        <img class="error-img" src="empty.png">
        <div style="margin-top: 32px">
        <h2> Список избранного пуст </h2>
        <p> Добавляйте изображения, нажимая на звездочки <p>
        </div>
      `;
favoriteListEmpty.classList.add('favorite-list-empty');
const mainWindow = document.querySelector('.main-window');

const errors = `<div class="error">
<img class="error-img" src="error.png">
<div style="display: flex flex-direction: column">
<h2> Сервер не отвечает </h2>
<p> Уже работаем над этим <p>
</div>
</div>`;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let artists = JSON.parse(localStorage.getItem('artist'));

function showFavorites() {
    favorites.forEach(favorite => {
        const favoritePhoto = document.createElement('div')
        favoritePhoto.classList.add('favorite-photo')
        favoritePhoto.innerHTML = `
     <div title="${favorite.title}" class="photo" style="background-image: url(${favorite.thumbnailUrl})">
    <input class="star-empty" type="image" src="star_active.png">   
    </div> 
    <p>${favorite.title}</p>
        `;
        favoritesList.append(favoritePhoto);
        favoritePhoto.querySelector('input').addEventListener('click', () => {
            removeFavorites(favorite);
            favoriteWindow.click();
        })
    })
}

function showArtists() {
    artists.forEach(user => {
        const artist = document.createElement('div');
        artist.classList.add('added-artist');
        artist.innerHTML = `<img src='open.svg'><h1>${user.name}<h1>`;
        artistsList.append(artist);
        const imgEl = artist.querySelector('img');
        imgEl.addEventListener('click', () => {
            if (artist.nextSibling?.classList.contains('albums')) {
                artist.nextSibling.remove();
                imgEl.src = 'open.svg';
                return;
            }
            imgEl.src = 'close.svg';
            const albumsList = document.createElement('div');
            albumsList.classList.add('albums');
            artist.after(albumsList);
            loadAlbums(user.id, albumsList);

        })
    })
}

function loadAlbums(id, elem) {
    elem.innerHTML = `<img class="loader" src="loader.gif">`
    fetch(`https://json.medrating.org/albums?userId=${id}`)
        .finally(() => elem.innerHTML = '')
        .then(response => response.json())
        .then(result => result.forEach(albums => {
            const album = document.createElement('div');
            album.classList.add('added-album');
            album.innerHTML = `<img src='open.svg'><p>${albums.title}<p>`
            elem.append(album);
            const imgEl = album.querySelector('img');
            imgEl.addEventListener('click', () => {
                if (album.nextSibling?.classList.contains('added-photo')) {
                    album.nextSibling.remove();
                    imgEl.src = 'open.svg';
                    return;
                }
                const photosList = document.createElement('div');
                photosList.classList.add('added-photo');
                imgEl.src = 'close.svg';
                loadPhotos(albums.id, photosList);
                album.after(photosList);
            })
        }))
        .catch(() => elem.innerHTML = errors)
}

function loadPhotos(id, elem) {
    elem.innerHTML = `<img class="loader" src="loader.gif">`
    fetch(`https://json.medrating.org/photos?albumId=${id}`)
        .finally(() => elem.innerHTML = '')
        .then(response => response.json())
        .then(result => result.forEach(photos => {
            let isFavorite = favorites.findIndex(item => item.id === photos.id) !== -1
            const photo = document.createElement('div');
            photo.innerHTML = `
            <div title="${photos.title}" class="photo" style="background-image: url(${photos.thumbnailUrl})">
            <input class="star-empty" type="image" src="star_${isFavorite ? 'active' : 'empty'}.png">
            </div> 
            `
            elem.append(photo);
            photo.addEventListener('click', () => {
                modal.innerHTML = ` 
                <div class="modal-image" style="background-image: url(${photos.url})"><div>
                `;
                document.body.style = "overflow: hidden";

                modal.classList.toggle("closed");
                modalOverlay.classList.toggle("closed");
                modalOverlay.innerHTML = `
                <input class="close-input" type="image" src="close_image.svg">
              `
                modalOverlay.querySelector('input').addEventListener('click', () => {
                    document.body.style = "overflow: auto"
                    modal.classList.toggle("closed");
                    modalOverlay.classList.toggle("closed");
                })
            })
            photo.querySelector('input').addEventListener('click', (e) => {
                e.stopPropagation();
                if (favorites.findIndex(item => item.id === photos.id) !== -1) {
                    photo.querySelector('input').src = "star_empty.png";
                    removeFavorites(photos);
                } else {
                    photo.querySelector('input').src = "star_active.png";
                    addFavorites(photos);
                }
            })
        }))
        .catch(() => elem.innerHTML = errors)


}

function removeFavorites(item) {
    favorites.splice(favorites.findIndex(favoriteItem => favoriteItem.id === item.id), 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function addFavorites(item) {
    favorites.push(item);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

favoriteWindow.addEventListener('click', () => {
    artistsList.remove();
    catalogWindow.classList.remove('catalog-active');
    favoriteWindow.classList.add('favorite-active');
    favoritesList.innerHTML = "";
    if (!favorites.length) {
        mainWindow.append(favoriteListEmpty);
    }
    showFavorites();
    mainWindow.append(favoritesList);
})

catalogWindow.addEventListener('click', () => {
    favoritesList.remove();
    favoriteListEmpty.remove();
    mainWindow.append(artistsList);
    favoriteWindow.classList.remove('favorite-active');
    catalogWindow.classList.add('catalog-active');
})

if (artists) {
    showArtists();
} else {
    artistsList.innerHTML = `<img class="catalog-loader" src="loader.gif">`
    fetch('https://json.medrating.org/users/')
        .finally(() => artistsList.innerHTML = '')
        .then(response => response.json())
        .then(result => {
            localStorage.setItem('artist', JSON.stringify(result));
            artists = result;
            showArtists();
        })
        .catch(() => artistsList.innerHTML = `<div class="catalog-error">
        <img class="error-img" src="error.png">
        <div style="margin-top: 32px">
        <h2> Сервер не отвечает </h2>
        <p> Уже работаем над этим <p>
        </div>
        </div> `)
}
catalogWindow.click();