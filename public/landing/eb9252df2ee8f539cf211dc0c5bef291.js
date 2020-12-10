jsFrontend.blog={init:function(){if($('input[data-role="blog-tag-filter"]').length>0){jsFrontend.blog.filter()
utils.filter.init()}},filter:function(){$('input[data-role="blog-tag-filter"]').on('change',function(event){let $itemParent=$(event.currentTarget).parents('.form-group')
let $loadingIcon=$('[data-role="filter-loading"]')
$loadingIcon.show()
$.ajax({url:'/frontend/ajax?'+$(this).closest('form').serialize(),data:{fork:{module:'Blog',action:'Filter'}}}).success(function(data){window.history.pushState(data.data,null,data.data.url)
$('[data-role="blog-filter-container"]').html(data.data.html)
utils.filter.updateTags(data.data.tags)
if($itemParent.hasClass('active')){$itemParent.removeClass('active')}else{$itemParent.addClass('active')}
window.fadeIn.fadeinOnScorll()
$loadingIcon.hide()})})
window.addEventListener('popstate',function(e){if(e.state){$('[data-role="blog-filter-container"]').html(e.state.html)
utils.filter.updateTags(e.state.tags)
return}
$.ajax({url:'/frontend/ajax?'+window.localtion.search,data:{fork:{module:'Blog',action:'Filter'}}}).success(function(data){$('[data-role="blog-filter-container"]').html(data.data.html)
utils.filter.updateTags(data.data.tags)})})}}
$(jsFrontend.blog.init)