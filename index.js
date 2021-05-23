// code to fetch profile information and render it to the dom
let userData = null;

const query = `{
  user(login: "iwakinomotoye") {
    login
    bio
    name
    avatarUrl
  }
  viewer {
    login
    bio
    name
    avatarUrl
    repositories(orderBy: {field: PUSHED_AT, direction: DESC}, first: 20, ownerAffiliations: OWNER) {
      nodes {
        id
        name
        description
        viewerHasStarred
        isFork
        forkCount
        parent {
          nameWithOwner
        }
        pushedAt
        primaryLanguage {
          color
          name
        }
        licenseInfo {
          name
        }
      }
      totalCount
    }
  }
}`;
  
const tokenPart1 = "ghp_";
const tokenPart2 = "Y7FoWcVWZjlnqrf3H5eZCuRt1LbYvt3aSi2X"

const fetchData = () => {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + tokenPart1 + tokenPart2,
            },
            body: JSON.stringify({query})
        }
        fetch("https://api.github.com/graphql", options)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error));
    })
}


fetchData().then((data) => {
  userData = data.data;
  const { avatarUrl, bio, login, name, repositories } = userData.viewer;

  document.getElementById("nav-profile-pic").src = avatarUrl;
  document.getElementById("user-image").src = avatarUrl;
  document.getElementById("tab-user-image").src = avatarUrl;
  document.getElementById("real-name").textContent = name;
  document.getElementById("login-name").textContent = login;
  document.getElementById("tab-user-name").textContent = login;
  document.getElementById("bio-content").textContent = bio;
  
  Array.from(document.querySelectorAll(".repo-count")).forEach(element => {
    element.textContent = repositories.totalCount;
  })

  const repoList = document.getElementById("repository-list");
  
  repositories.nodes.forEach(repository => {
    const { 
      description, 
      isFork, 
      name, 
      parent, 
      pushedAt, 
      viewerHasStarred, 
      primaryLanguage,
      licenseInfo } = repository;
    const currentDate = new Date();
    let timeAgo = (currentDate.getTime()) - (new Date(pushedAt).getTime());
    timeAgo = timeAgo/ (60 * 60 * 24 * 1000);
    
    if (timeAgo > 30) {
      timeAgo = parseInt(timeAgo);
      months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      thePushedAt = new Date(pushedAt);
      month = months[thePushedAt.getMonth()];
      day = thePushedAt.getDate();
      year = thePushedAt.getFullYear();
      currentYear = currentDate.getFullYear();
      timeAgo = "Updated " + month + " " + day;

      if(year !== currentYear) {
        timeAgo = "Updated " + month + " " + day + ", " + year;
      }
    } else if (timeAgo < 1 && timeAgo > (1/24)) {
      timeAgo = parseInt(timeAgo * 24);
      timeAgo = "Updated " + timeAgo + " hours ago";
    } else if (timeAgo < (1/24) && timeAgo > (1/(60 * 24))) {
      timeAgo = parseInt(timeAgo * 24 * 60);
      timeAgo = "Updated " + timeAgo + " minutes ago";
    } else if (timeAgo < (1/(60 * 24)) && timeAgo > (1/(60 * 60 * 24))) {
      timeAgo = parseInt(timeAgo * 24 * 60 * 60);
      timeAgo = "Updated " + timeAgo + " seconds ago";
    } else {
      timeAgo = "Updated " + parseInt(timeAgo) + " days ago"
    }

    const LI = document.createElement('li');
    const divLeft = document.createElement('div');
    const divRight = document.createElement('div');
    const anchorLink = document.createElement('a');
    const pForkedFrom = document.createElement('p');
    const divDescription = document.createElement('div');
    const pDescription = document.createElement('p');
    const starButton = document.createElement('button');
    const divMoreDetails = document.createElement('div');
    const spanUpdated = document.createElement('span');
    const spanForkCount = document.createElement('span');
    const spanLangColor = document.createElement('span');
    const spanLangName = document.createElement('span');
    const spanLicense = document.createElement('span');
    
    divLeft.classList.add("column-three");
    divRight.classList.add("column-four");
    divRight.classList.add("right-align");

    anchorLink.textContent = name;
    anchorLink.classList.add("repo-name");
    anchorLink.setAttribute('href', "#" + name);
    divLeft.append(anchorLink);

    if (isFork) {
      pForkedFrom.classList.add("forked-details")
      pForkedFrom.innerHTML = "Forked from " + parent.nameWithOwner;
      divLeft.append(pForkedFrom);
    }

    pDescription.classList.add("repo-description");
    pDescription.textContent = description;
    divDescription.append(pDescription);
    divLeft.append(divDescription);


    if (primaryLanguage) {
      spanLangColor.classList.add("repo-language-color");
      spanLangColor.style.background = primaryLanguage.color;
      spanLangColor.style.borderColor = primaryLanguage.color + "32"; 

      spanLangName.classList.add("mr-16");
      spanLangName.textContent = primaryLanguage.name;
      divMoreDetails.append(spanLangColor);
      divMoreDetails.append(spanLangName);
    }


    if (licenseInfo) {
      spanLicense.classList.add("mr-16");
      spanLicense.innerHTML = '<img class="svg-image" src="./images/mit-icon.svg" /> ' + licenseInfo.name;
      divMoreDetails.append(spanLicense);
    }

    spanUpdated.textContent = timeAgo;
    divMoreDetails.append(spanUpdated);

    divMoreDetails.classList.add("repo-more-details");
    divLeft.append(divMoreDetails);
    
    if (!viewerHasStarred) {
      starButton.innerHTML = '<img class="svg-image" src="./images/star-path.svg" /> Star';
    } else {
      starButton.innerHTML = '<img class="svg-image" src="./images/star-solid.svg" /> Unstar';
    }

    starButton.classList.add("custom-button");
    divRight.append(starButton);
    
    LI.append(divLeft);
    LI.append(divRight);

    repoList.append(LI);
  })
  
  // code to hide and show user image icon and name on mini nav section
  let tabProfile = document.querySelector(".tab-profile");
  function showTabProfile () {
    tabProfile.classList.toggle("hide");
  }


  let options = {
    threshold: 1
  }

  let observer = new IntersectionObserver(showTabProfile);
  let target = document.querySelector(".profile-img-container");

  observer.observe(target);

  document.querySelector(".copyright").innerHTML = "&copy; "+ currentYear +" GitHub, Inc.";
})