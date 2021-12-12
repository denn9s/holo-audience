$.ajax({
    url : '/api/member/all/',
    type : 'GET',
    dataType:'json',
    success : function(data) {
        let created_columns = [];
        let member_row = document.getElementById('member_row');
        for (let member of data) {
            if (created_columns.includes(member.group_data.generation_name) === false) {
                // add new column
                created_columns.push(member.group_data.generation_name);
                const new_column = document.createElement('div');
                new_column.setAttribute('id', `${member.group_data.generation_name}_col`)
                new_column.classList.add('col-md-4', 'col-12');
                member_row.appendChild(new_column);
                const new_header = document.createElement('p');
                new_header.classList.add('h3', 'text-center', 'generation-header');
                new_header.textContent = `${member.group_data.generation_name}`.replace('_', ' ');
                new_column.appendChild(new_header);
            }
            // creating base card
            const member_card = document.createElement('div');
            member_card.classList.add('card', 'member-card', 'text-center', 'border-dark');
            const member_card_row = document.createElement('div');
            member_card_row.classList.add('row', 'no-gutters');
            // creating image column
            const member_card_image = document.createElement('img');
            if (member.icon_link.length === 0) {
                member_card_image.src = 'https://i.imgur.com/z70J55x.png';
            } else {
                member_card_image.src = member.icon_link;
            }
            member_card_image.classList.add('member-card-img');
            const member_card_image_col = document.createElement('div');
            member_card_image_col.classList.add('col-4', 'my-auto');
            member_card_image_col.appendChild(member_card_image);
            // creating body column
            const member_card_body = document.createElement('div');
            member_card_body.classList.add('card-body');
                // header (member name)
                const member_card_title = document.createElement('h5');
                member_card_title.classList.add('card-title');
                member_card_title.textContent = member.name;
                // viewer count button
                const member_card_link = document.createElement('a');
                member_card_link.classList.add('btn', 'btn-link', 'stretched-link', 'viewer-count-button');
                member_card_link.setAttribute('href', `/${member.id}`);
                member_card_link.textContent = `${member.total_streams} streams`;
            // assembling body
            member_card_body.appendChild(member_card_title);
            member_card_body.appendChild(member_card_link);
            member_card_body_col = document.createElement('div');
            member_card_body_col.classList.add('col-7', 'my-auto');
            member_card_body_col.appendChild(member_card_body);
            // assembling card
            member_card_row.appendChild(member_card_image_col);
            member_card_row.appendChild(member_card_body_col);
            member_card.appendChild(member_card_row);
            // adding card to proper column
            const found_column = document.getElementById(`${member.group_data.generation_name}_col`);
            found_column.appendChild(member_card);
        }
    },
    error : function(req, err) {
        alert(err);
    }
});