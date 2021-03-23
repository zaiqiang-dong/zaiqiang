recursive_func(problem) {

	//条件满足退出
	if(condition == OK)
		return;

	//对问题一部分进行递归
	recursive_func(problem.partA);

	//对问题另一部分进行递归
	recursive_func(problem.partB);

}






